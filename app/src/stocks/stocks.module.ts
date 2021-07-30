import { Module } from '@nestjs/common';
import { TwitterApiModule } from 'src/twitter-api/twitter-api.module';
import { YahooApiModule } from 'src/yahoo-api/yahoo-api.module';
import { StocksController } from './stocks.controller';

@Module({
  imports: [YahooApiModule, TwitterApiModule],
  controllers: [StocksController],
})
export class StocksModule {}
