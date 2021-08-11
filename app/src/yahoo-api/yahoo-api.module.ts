import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { YahooApiService } from './yahoo-api.service';

@Module({
  imports: [HttpModule],
  providers: [YahooApiService],
  exports: [YahooApiService],
})
export class YahooApiModule {}
