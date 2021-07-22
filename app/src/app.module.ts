import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { cacheConfig } from './config/cache.config';
import { coreConfig } from './config/core.config';
import { dbConfig } from './config/db.config';
import { RedisCacheModule } from './redis-cache/redis-cache.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [dbConfig, cacheConfig, coreConfig],
      isGlobal: true,
    }),
    RedisCacheModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
