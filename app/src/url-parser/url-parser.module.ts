import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { FetchLimiter } from 'src/interceptors/rate-limiter';
import { UrlParserController } from './url-parser.controller';
import { UrlParserService } from './url-parser.service';

@Module({
  controllers: [UrlParserController],
  providers: [UrlParserService],
})
export class UrlParserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(FetchLimiter).forRoutes({ path: 'api/url-parse*', method: RequestMethod.ALL });
  }
}
