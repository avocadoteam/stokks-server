import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { UrlParserService } from './url-parser.service';

@Controller('api/url-parse')
@UseInterceptors(TransformInterceptor)
export class UrlParserController {
  constructor(private readonly up: UrlParserService) {}

  @Get()
  getInfo(@Query('link') link: string) {
    return this.up.getArticleImg(link);
  }
}
