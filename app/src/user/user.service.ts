import {
  HistoricalData,
  HistoryPeriodTarget,
  TriggerName,
  UserNotificationInfo,
  UserNotificationModel,
  UserNotificationUpdateModel,
  UserStoreItem,
} from '@models';
import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { genSalt, hash } from 'bcrypt';
import { userConfig } from 'src/config/user.config';
import { BusEvent } from 'src/contracts/events/bus';
import { StockSymbol } from 'src/db/client/tables/StockSymbol';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { UserNotification } from 'src/db/client/tables/UserNotification';
import { UserStocksStore } from 'src/db/client/tables/UserStocksStore';
import { autoRetryTransaction } from 'src/db/utils/transactions';
import { EventBus } from 'src/events/events.bus';
import { convertNI } from 'src/utils/pg-interval';
import { now } from 'src/utils/time';
import { YahooApiService } from 'src/yahoo-api/yahoo-api.service';
import { Connection, IsNull, Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserAccount)
    private readonly ua: Repository<UserAccount>,
    @InjectRepository(UserStocksStore)
    private readonly uss: Repository<UserStocksStore>,
    @InjectRepository(UserNotification)
    private readonly un: Repository<UserNotification>,
    private readonly connection: Connection,
    private readonly ya: YahooApiService,
    @Inject(userConfig.KEY)
    private readonly uConfig: ConfigType<typeof userConfig>,
  ) {
    if (!!uConfig.userName && !!uConfig.userPass) {
      this.ua.count({ where: { name: uConfig.userName } }).then(r => {
        if (!r) {
          this.createUser(uConfig.userPass!, uConfig.userName);
        }
      });
    }
  }

  async createUser(password: string, name?: string) {
    const userId = await autoRetryTransaction(this.connection, async qr => {
      const newUser = new UserAccount();

      const passSalt = await genSalt();
      const passHash = await hash(password, passSalt);

      newUser.passHash = passHash as any;
      newUser.passSalt = passSalt as any;
      newUser.name = name;

      await qr.manager.save(newUser);

      await qr.commitTransaction();
      return newUser.id;
    });

    return userId;
  }
  async createGoogleUser(email: string, id: string) {
    const userId = await autoRetryTransaction(this.connection, async qr => {
      const exists = await qr.manager.findOne(UserAccount, { where: { email } });
      if (exists) return exists.id;

      const newUser = new UserAccount();

      const passSalt = await genSalt();
      const passHash = await hash(id, passSalt);

      newUser.passHash = passHash as any;
      newUser.passSalt = passSalt as any;
      newUser.email = email;

      await qr.manager.save(newUser);

      await qr.commitTransaction();
      return newUser.id;
    });

    return userId;
  }

  async hasUser(userId?: number) {
    return (await this.ua.count({ where: { id: userId } })) > 0;
  }

  async hasUserNotification(userId: number, symbol: string) {
    return (
      (await this.un
        .createQueryBuilder('un')
        .innerJoin('un.user', 'ua', 'ua.id = :userId', { userId })
        .innerJoin('un.stockSymbol', 'symbol', 'symbol.name = :symbol and symbol.deleted is null', {
          symbol: symbol.toLowerCase(),
        })
        .getCount()) > 0
    );
  }

  async getUserStore(userId: number): Promise<UserStoreItem[]> {
    const store = await this.uss
      .createQueryBuilder('uss')
      .innerJoinAndSelect('uss.stockSymbol', 'symbol', 'symbol.deleted is null')
      .innerJoinAndSelect('uss.user', 'ua', 'ua.id = :userId', { userId })
      .getMany();

    if (!store.length) {
      return [];
    }

    const symbols = store.map(s => s.stockSymbol.name);

    const data = await this.ya.getCombineInfo(symbols);
    const promises: Promise<HistoricalData>[] = [];

    for (const symbolInfo of data) {
      promises.push(this.ya.getHistory(symbolInfo.symbol, HistoryPeriodTarget.Day));
    }

    const history = await Promise.all(promises);

    return data
      .map(d => ({
        ...d,
        symbolId: store.find(s => s.stockSymbol.name === d.symbol.toLowerCase())?.stock_symbol_id ?? '',
        history: history.find(h => h.symbol.toLowerCase() === d.symbol.toLowerCase())!,
      }))
      .filter(d => !!d.symbolId);
  }

  async fillTheStore(userId: number, symbol: string) {
    await autoRetryTransaction(this.connection, async qr => {
      let stockSymbolId: string | null = null;
      const stockSymbol = await qr.manager.findOne(StockSymbol, {
        where: { name: symbol.toLowerCase(), deleted: IsNull() },
      });

      if (!stockSymbol) {
        const newStockSymbol = new StockSymbol();
        newStockSymbol.name = symbol.toLowerCase();

        await qr.manager.save(newStockSymbol);

        stockSymbolId = newStockSymbol.id;
      } else {
        stockSymbolId = stockSymbol.id;
      }

      const userStore = new UserStocksStore();
      userStore.stock_symbol_id = stockSymbolId;
      userStore.user_account_id = userId;

      await qr.manager.save(userStore);

      await qr.commitTransaction();
    });
  }

  async deleteFromTheStore(userId: number, symbolId: string) {
    await this.uss.delete({ stock_symbol_id: symbolId, user_account_id: userId });

    await this.un.update(
      {
        deleted: IsNull(),
        stockSymbol: { id: symbolId },
        user: { id: userId },
      },
      { deleted: now() },
    );
  }

  async createNotification(userId: number, { symbol, notifyInterval, triggerParam, triggerValue }: UserNotificationModel) {
    const notification = await autoRetryTransaction(this.connection, async qr => {
      let stockSymbolId: string | null = null;
      const stockSymbol = await qr.manager.findOne(StockSymbol, {
        where: { name: symbol.toLowerCase(), deleted: IsNull() },
      });

      if (!stockSymbol) {
        const newStockSymbol = new StockSymbol();
        newStockSymbol.name = symbol.toLowerCase();

        await qr.manager.save(newStockSymbol);

        stockSymbolId = newStockSymbol.id;
      } else {
        stockSymbolId = stockSymbol.id;
      }

      const newNotification = new UserNotification();

      newNotification.notifyInterval = notifyInterval;
      newNotification.triggerName = TriggerName.PriceMatch;
      newNotification.triggerParam = triggerParam;
      newNotification.triggerValue = triggerValue;
      newNotification.stockSymbol = stockSymbolId as unknown as StockSymbol;
      newNotification.user = userId as unknown as UserAccount;

      await qr.manager.save(newNotification);

      await qr.commitTransaction();

      return newNotification;
    });

    EventBus.emit(BusEvent.UserCreatedNotification, {
      deleted: notification.deleted,
      id: notification.id,
      notifyInterval: notification.notifyInterval,
    });

    return notification.id;
  }

  async getNotificationBySymbolId(userId: number, symbolId: string): Promise<UserNotificationInfo> {
    const notification = await this.un
      .createQueryBuilder('un')
      .innerJoin('un.user', 'ua', 'ua.id = :userId', { userId })
      .innerJoin('un.stockSymbol', 'ss', 'ss.id = :symbolId', { symbolId })
      .getOne();

    if (!notification) {
      throw new NotFoundException();
    }

    return {
      deleted: notification.deleted,
      id: notification.id,
      notifyInterval: convertNI(notification.notifyInterval),
      triggerName: notification.triggerName,
      triggerParam: notification.triggerParam,
      triggerValue: notification.triggerValue,
    };
  }

  async updateNotification(
    userId: number,
    notificationId: number,
    data: UserNotificationUpdateModel,
  ): Promise<UserNotificationInfo> {
    const notification = await autoRetryTransaction(this.connection, async qr => {
      const notif = await qr.manager.findOneBy(UserNotification, { id: notificationId, user: { id: userId } });

      if (!notif) {
        return null;
      }

      notif.notifyInterval = data.notifyInterval;
      notif.triggerParam = data.triggerParam;
      notif.triggerValue = data.triggerValue;
      notif.deleted = data.delete ? now() : null;

      await qr.manager.save(notif);

      await qr.commitTransaction();

      return notif;
    });

    if (!notification) {
      throw new NotFoundException();
    }

    EventBus.emit(BusEvent.UserChangedNotification, {
      deleted: notification.deleted,
      id: notification.id,
      notifyInterval: notification.notifyInterval,
    });

    return {
      deleted: notification.deleted,
      id: notification.id,
      notifyInterval: convertNI(notification.notifyInterval),
      triggerName: notification.triggerName,
      triggerParam: notification.triggerParam,
      triggerValue: notification.triggerValue,
    };
  }
}
