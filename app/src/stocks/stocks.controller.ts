import { HistoryPeriodTarget } from '@models';
import { Body, Controller, Get, Post, Query, UseInterceptors } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { TwitterApiService } from 'src/twitter-api/twitter-api.service';
import { YahooApiService } from 'src/yahoo-api/yahoo-api.service';
import { SearchDto, SymbolHystoryDto, SymbolInfoDto, TrendingDto } from './dto/stocks.dto';

@ApiTags('Stocks information')
@ApiResponse({ status: 400, description: 'You re sending shit' })
@Controller('api/stocks')
@UseInterceptors(TransformInterceptor)
export class StocksController {
  constructor(private readonly ya: YahooApiService, private readonly tw: TwitterApiService) {}

  @ApiResponse({ schema: { example: { data: 'YahooSearchResult[]' } }, status: 200 })
  @ApiQuery({ name: 'query', required: true })
  @Get('search')
  searchAutoc(@Query() model: SearchDto) {
    return this.ya.startSearch(model.query);
  }

  @ApiResponse({ schema: { example: { data: 'SymbolGeneralInfo' } }, status: 200 })
  @ApiQuery({ name: 'symbol', required: true })
  @Get('symbol/info')
  getSymbolInfo(@Query() model: SymbolInfoDto) {
    return this.ya.getSymbolInfo(model.symbol);
  }

  @ApiResponse({ schema: { example: { data: 'HistoricalData' } }, status: 200 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        target: { type: 'enum', enum: [HistoryPeriodTarget] },
      },
    },
  })
  @Post('symbol/history')
  getSymbolHistory(@Body() model: SymbolHystoryDto) {
    return this.ya.getHistory(model.symbol, model.target);
  }

  @ApiResponse({ schema: { example: { data: 'HistoryResponseModel' } }, status: 200 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        target: { type: 'enum', enum: [HistoryPeriodTarget] },
      },
    },
  })
  @Post('symbol/history/full')
  getCompleteSymbolHistory(@Body() model: SymbolHystoryDto) {
    return this.ya.getCompleteHistory(model.symbol, model.target);
  }

  @ApiResponse({ schema: { example: { data: 'NewsItem[]' } }, status: 200, description: 'returns only 5 latest news' })
  @ApiQuery({ name: 'query', required: true })
  @Get('symbol/news')
  getNews(@Query() model: SearchDto) {
    return this.ya.getLatestNews(model.query);
  }

  @ApiOperation({ summary: 'returns only 5 most popular tweets about requested {query}' })
  @ApiResponse({ schema: { example: { data: 'Tweet[]' } }, status: 200 })
  @ApiQuery({ name: 'query', required: true })
  @Get('symbol/tweets')
  getRecentTweets(@Query() model: SearchDto) {
    return this.tw.search(model.query);
  }

  @ApiResponse({ schema: { example: { data: 'YahooSearchResult[]' } }, status: 200 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        count: { type: 'number', maximum: 8, minimum: 1 },
      },
    },
  })
  @Post('symbol/trending')
  getTrendingSymbols(@Body() model: TrendingDto) {
    return this.ya.getTrendingSymbols(model.count);
  }
}
