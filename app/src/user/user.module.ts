import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';

import { BullModule } from '@nestjs/bull';
import { ExpoSettings } from 'src/db/client/tables/ExpoSettings';
import { FetchLimiter } from 'src/interceptors/rate-limiter';
import { NotificationProcessor } from './notification.processor';
import { NotificationService } from './notification.service';
import { QueueName } from 'src/contracts/queue';
import { StockSymbol } from 'src/db/client/tables/StockSymbol';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserAccount } from 'src/db/client/tables/UserAccount';
import { UserController } from './user.controller';
import { UserExpoService } from './user-expo.service';
import { UserNotification } from 'src/db/client/tables/UserNotification';
import { UserService } from './user.service';
import { UserStocksStore } from 'src/db/client/tables/UserStocksStore';
import { YahooApiModule } from 'src/yahoo-api/yahoo-api.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StockSymbol, UserAccount, UserNotification, UserStocksStore, ExpoSettings]),
    YahooApiModule,
    BullModule.registerQueue({
      name: QueueName.UserPriceNotification,
    }),
  ],
  controllers: [UserController],
  providers: [UserService, UserExpoService, NotificationProcessor, NotificationService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FetchLimiter).forRoutes({ path: 'api/user*', method: RequestMethod.ALL });
  }
}
