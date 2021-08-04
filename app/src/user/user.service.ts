import {
  TriggerName,
  UserNotificationInfo,
  UserNotificationModel,
  UserNotificationUpdateModel,
  UserStoreItem,
} from '@models';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { genSalt, hash } from 'bcrypt';
import { BusEvent } from 'src/contracts/events/bus';
import { StockSymbol } from 'src/db/client/tables/StockSymbol';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { UserNotification } from 'src/db/client/tables/UserNotification';
import { UserStocksStore } from 'src/db/client/tables/UserStocksStore';
import { autoRetryTransaction } from 'src/db/utils/transactions';
import { EventBus } from 'src/events/events.bus';
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
  ) {}

  async createUser(password: string) {
    const userId = await autoRetryTransaction(this.connection, async qr => {
      const newUser = new UserAccount();

      const passSalt = await genSalt();
      const passHash = await hash(password, passSalt);

      newUser.passHash = passHash as any;
      newUser.passSalt = passSalt as any;

      await qr.manager.save(newUser);

      await qr.commitTransaction();
      return newUser.id;
    });

    return userId;
  }

  async hasUser(userId: number) {
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
      throw new NotFoundException();
    }

    const symbols = store.map(s => s.stockSymbol.name);

    const data = await this.ya.getCombineInfo(symbols);

    return data
      .map(d => ({
        ...d,
        symbolId: store.find(s => s.stockSymbol.name === d.symbol.toLowerCase())?.stock_symbol_id ?? '',
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

  async createNotification({ symbol, notifyInterval, triggerParam, triggerValue, userId }: UserNotificationModel) {
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

  async getNotification(userId: number, notificationId: number): Promise<UserNotificationInfo> {
    const notification = await this.un
      .createQueryBuilder('un')
      .innerJoin('un.user', 'ua', 'ua.id = :userId', { userId })
      .where('un.id = :notificationId', {
        notificationId,
      })
      .getOne();

    if (!notification) {
      throw new NotFoundException();
    }

    return {
      deleted: notification.deleted,
      id: notification.id,
      notifyInterval: notification.notifyInterval,
      triggerName: notification.triggerName,
      triggerParam: notification.triggerParam,
      triggerValue: notification.triggerValue,
    };
  }

  async updateNotification(notificationId: number, data: UserNotificationUpdateModel): Promise<UserNotificationInfo> {
    const notification = await autoRetryTransaction(this.connection, async qr => {
      const notif = await qr.manager.findOne(UserNotification, notificationId);

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
      notifyInterval: notification.notifyInterval,
      triggerName: notification.triggerName,
      triggerParam: notification.triggerParam,
      triggerValue: notification.triggerValue,
    };
  }
}
