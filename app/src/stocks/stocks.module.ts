import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { FetchLimiter } from 'src/interceptors/rate-limiter';
import { TwitterApiModule } from 'src/twitter-api/twitter-api.module';
import { YahooApiModule } from 'src/yahoo-api/yahoo-api.module';
import { StocksController } from './stocks.controller';

@Module({
  imports: [YahooApiModule, TwitterApiModule],
  controllers: [StocksController],
})
export class StocksModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FetchLimiter).forRoutes({ path: 'api/stocks*', method: RequestMethod.ALL });
  }
}
