import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { cacheConfig } from './config/cache.config';
import { coreConfig } from './config/core.config';
import { dbConfig } from './config/db.config';
import { jwtConfig } from './config/jwt.config';
import { twitterConfig } from './config/twitter.config';
import { userConfig } from './config/user.config';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { StocksModule } from './stocks/stocks.module';
import { TwitterApiModule } from './twitter-api/twitter-api.module';
import { UrlParserModule } from './url-parser/url-parser.module';
import { UserModule } from './user/user.module';
import { redisOptsFromUrl } from './utils/redis-url';
import { ASKTHM } from './utils/time';
import { YahooApiModule } from './yahoo-api/yahoo-api.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [dbConfig, cacheConfig, coreConfig, twitterConfig, jwtConfig, userConfig],
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        ...(configService.get<string>('database.psqlUrl')
          ? {
              url: configService.get<string>('database.psqlUrl'),
            }
          : {
              host: configService.get<string>('database.host'),
              port: configService.get<number>('database.port'),
              username: configService.get<string>('database.username'),
              password: configService.get<string>('database.password'),
              database: configService.get<string>('database.dbName'),
            }),
        entities: [__dirname + '/db/client/tables/*{.ts,.js}'],
        migrations: [__dirname + '/db/client/migrations/*{.ts,.js}'],
        synchronize: false,
        migrationsRun: true,
        logNotifications: true,
        logger: 'advanced-console',
        logging: configService.get<boolean>('core.devMode')
          ? ['query', 'schema', 'error', 'warn']
          : ['migration', 'error', 'warn'],
      }),
      inject: [ConfigService],
    }),
    BullModule.forRootAsync({
      useFactory: (configService: ConfigService) => ({
        redis: !configService.get<string>('cache.uri')
          ? {
              host: configService.get<string>('cache.host'),
              port: configService.get<number>('cache.port'),
              db: configService.get<number>('cache.db'),
            }
          : redisOptsFromUrl(configService.get<string>('cache.uri')!),

        defaultJobOptions: {
          removeOnComplete: true,
          removeOnFail: true,
          attempts: 5,
          backoff: {
            type: 'exponential',
            delay: ASKTHM,
          },
        },
      }),
      inject: [ConfigService],
    }),
    RedisCacheModule,
    StocksModule,
    YahooApiModule,
    TwitterApiModule,
    UrlParserModule,
    UserModule,
    AuthModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
