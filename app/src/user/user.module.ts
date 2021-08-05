import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QueueName } from 'src/contracts/queue';
import { StockSymbol } from 'src/db/client/tables/StockSymbol';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { UserNotification } from 'src/db/client/tables/UserNotification';
import { UserStocksStore } from 'src/db/client/tables/UserStocksStore';
import { FetchLimiter } from 'src/interceptors/rate-limiter';
import { YahooApiModule } from 'src/yahoo-api/yahoo-api.module';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockSymbol, UserAccount, UserNotification, UserStocksStore]),
    YahooApiModule,
    BullModule.registerQueue({
      name: QueueName.UserPriceNotification,
    }),
  ],
  controllers: [UserController],
  providers: [UserService, NotificationProcessor, NotificationService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FetchLimiter).forRoutes({ path: 'api/user*', method: RequestMethod.ALL });
  }
}
