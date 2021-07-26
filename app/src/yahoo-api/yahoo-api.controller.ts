import { Controller, Get, Query, UseInterceptors } from '@nestjs/common';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { YahooApiService } from './yahoo-api.service';

@Controller('api/yahoo')
@UseInterceptors(TransformInterceptor)
export class YahooApiController {
  constructor(private readonly ya: YahooApiService) {}

  @Get()
  getInfo(@Query('query') query: string) {
    return this.ya.startSearch(query);
  }
}
