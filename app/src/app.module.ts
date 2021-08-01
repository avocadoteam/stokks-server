import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { cacheConfig } from './config/cache.config';
import { coreConfig } from './config/core.config';
import { dbConfig } from './config/db.config';
import { twitterConfig } from './config/twitter.config';
import { StocksModule } from './stocks/stocks.module';
import { RedisCacheModule } from './redis-cache/redis-cache.module';
import { TwitterApiModule } from './twitter-api/twitter-api.module';
import { UrlParserModule } from './url-parser/url-parser.module';
import { YahooApiModule } from './yahoo-api/yahoo-api.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [dbConfig, cacheConfig, coreConfig, twitterConfig],
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
    RedisCacheModule,
    StocksModule,
    YahooApiModule,
    TwitterApiModule,
    UrlParserModule,
    UserModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
