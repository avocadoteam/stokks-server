import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { cacheConfig } from './config/cache.config';
import { coreConfig } from './config/core.config';
import { dbConfig } from './config/db.config';
import { twitterConfig } from './config/twitter.config';
import { FaSearchModule } from './fa-search/fa-search.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { TwitterApiModule } from './twitter-api/twitter-api.module';
import { YahooApiModule } from './yahoo-api/yahoo-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [dbConfig, cacheConfig, coreConfig, twitterConfig],
      isGlobal: true,
    }),
    RedisCacheModule,
    FaSearchModule,
    YahooApiModule,
    TwitterApiModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
