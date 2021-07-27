import { Module } from '@nestjs/common';
import { YahooApiService } from './yahoo-api.service';

@Module({
  providers: [YahooApiService],
  exports: [YahooApiService],
})
export class YahooApiModule {}
