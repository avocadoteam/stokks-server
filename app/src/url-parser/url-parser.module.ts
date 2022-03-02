import { BullModule } from '@nestjs/bull';
import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { QueueName } from 'src/contracts/queue';
import { FetchLimiter } from 'src/interceptors/rate-limiter';
import { UrlParserController } from './url-parser.controller';
import { UrlParserProcessor } from './url-parser.processor';
import { UrlParserService } from './url-parser.service';

@Module({
  imports: [
    BullModule.registerQueue({
      name: QueueName.ArticleParse,
    }),
  ],
  controllers: [UrlParserController],
  providers: [UrlParserService, UrlParserProcessor],
})
export class UrlParserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FetchLimiter).forRoutes({ path: 'api/url-parse*', method: RequestMethod.ALL });
  }
}
