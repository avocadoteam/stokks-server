import { Module } from '@nestjs/common';
import { UrlParserController } from './url-parser.controller';
import { UrlParserService } from './url-parser.service';

@Module({
  controllers: [UrlParserController],
  providers: [UrlParserService],
})
export class UrlParserModule {}
