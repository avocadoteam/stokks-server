import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { FetchLimiter } from 'src/interceptors/rate-limiter';
import { YahooApiController } from './yahoo-api.controller';
import { YahooApiService } from './yahoo-api.service';

@Module({
  imports: [],
  controllers: [YahooApiController],
  providers: [YahooApiService],
  exports: [YahooApiService],
})
export class YahooApiModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FetchLimiter);
  }
}
