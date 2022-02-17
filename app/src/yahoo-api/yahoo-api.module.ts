import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StockSymbol } from 'src/db/client/tables/StockSymbol';
import { YahooApiService } from './yahoo-api.service';

@Module({
  imports: [HttpModule, TypeOrmModule.forFeature([StockSymbol])],
  providers: [YahooApiService],
  exports: [YahooApiService],
})
export class YahooApiModule {}
