import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { cacheConfig } from './config/cache.config';
import { coreConfig } from './config/core.config';
import { dbConfig } from './config/db.config';
import { FaSearchModule } from './fa-search/fa-search.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { YahooApiModule } from './yahoo-api/yahoo-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [dbConfig, cacheConfig, coreConfig],
      isGlobal: true,
    }),
    RedisCacheModule,
    FaSearchModule,
    YahooApiModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
