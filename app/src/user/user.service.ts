import { UserNotificationModel, UserStoreItem } from '@models';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { StockSymbol } from 'src/db/client/tables/StockSymbol';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { UserNotification } from 'src/db/client/tables/UserNotification';
import { UserStocksStore } from 'src/db/client/tables/UserStocksStore';
import { autoRetryTransaction } from 'src/db/utils/transactions';
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

  async createUser() {
    const userId = await autoRetryTransaction(this.connection, async qr => {
      const newUser = new UserAccount();

      await qr.manager.save(newUser);

      await qr.commitTransaction();
      return newUser.id;
    });

    return userId;
  }

  async hasUser(userId: number) {
    return (await this.ua.count({ where: { id: userId } })) > 0;
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
        userAccount: { id: userId },
      },
      { deleted: now() },
    );
  }

  async createNotification({ symbol, target, priceMatch, userId }: UserNotificationModel) {
    const notificationId = await autoRetryTransaction(this.connection, async qr => {
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

      newNotification.notifyInterval = target;
      newNotification.priceMatch = priceMatch;
      newNotification.stockSymbol = stockSymbolId as unknown as StockSymbol;
      newNotification.userAccount = userId as unknown as UserAccount;

      await qr.manager.save(newNotification);

      await qr.commitTransaction();

      return newNotification.id;
    });

    return notificationId;
  }
}
