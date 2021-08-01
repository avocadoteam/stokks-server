import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockSymbol } from 'src/db/client/tables/StockSymbol';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { UserNotification } from 'src/db/client/tables/UserNotification';
import { UserStocksStore } from 'src/db/client/tables/UserStocksStore';
import { YahooApiModule } from 'src/yahoo-api/yahoo-api.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [TypeOrmModule.forFeature([StockSymbol, UserAccount, UserNotification, UserStocksStore]), YahooApiModule],
  controllers: [UserController],
  providers: [UserService],
})
export class UserModule {}
