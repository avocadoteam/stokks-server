import { HistoricalData, HistoryPeriodTarget, NewsItem, SymbolGeneralInfo, YahooSearchResult } from '@models';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { firstValueFrom } from 'rxjs';
import { HistoryResponseModel, SearchResponseModel } from 'src/contracts/yahoo';
import { StockSymbol } from 'src/db/client/tables/StockSymbol';
import { IsNull, Repository } from 'typeorm';
import yahooFinance from 'yahoo-finance2';
import { Quote, QuoteResponseArray } from 'yahoo-finance2/dist/esm/src/modules/quote';

@Injectable()
export class YahooApiService {
  constructor(
    private readonly httpService: HttpService,
    @InjectRepository(StockSymbol)
    private readonly ssTable: Repository<StockSymbol>,
  ) {}

  async startSearch(query: string): Promise<YahooSearchResult[]> {
    const autocResults = await this.yahooSearch(query);

    const symbols = autocResults?.quotes.map(r => r.symbol);

    if (!symbols?.length) {
      return [];
    }

    const results = await (yahooFinance.quote(
      symbols,
      {
        fields: ['regularMarketPrice', 'regularMarketChange', 'shortName'],
      },
      { validateResult: false },
    ) as Promise<QuoteResponseArray>);
    return results.map(r => ({
      regularMarketChange: r.regularMarketChange ?? 0,
      regularMarketPrice: r.regularMarketPrice ?? 0,
      symbol: r.symbol,
      shortname: r.shortName,
    }));
  }

  async getSymbolInfo(symbol: string): Promise<SymbolGeneralInfo> {
    const result = await (yahooFinance.quote(
      symbol,
      {
        fields: [
          'regularMarketPrice',
          'regularMarketChange',
          'marketCap',
          'regularMarketVolume',
          'regularMarketDayRange',
          'regularMarketOpen',
          'fullExchangeName',
        ],
      },
      { validateResult: false },
    ) as Promise<Quote>);

    const stockSymbol = await this.ssTable.findOne({
      where: { name: symbol.toLowerCase(), deleted: IsNull() },
    });

    return {
      fullExchangeName: result.fullExchangeName,
      marketCap: result.marketCap ?? 0,
      regularMarketChange: result.regularMarketChange ?? 0,
      regularMarketDayRange: result.regularMarketDayRange ?? { high: 0, low: 0 },
      regularMarketOpen: result.regularMarketOpen ?? 0,
      regularMarketPrice: result.regularMarketPrice ?? 0,
      regularMarketVolume: result.regularMarketVolume ?? 0,
      symbolId: stockSymbol?.id ?? null,
    };
  }

  async getLatestNews(query: string): Promise<NewsItem[]> {
    const { news } = await yahooFinance.search(query, { newsCount: 5, quotesCount: 0 });
    return news.map(r => ({
      link: r.link,
      providerPublishTime: r.providerPublishTime,
      publisher: r.publisher,
      title: r.title,
      uuid: r.uuid,
    }));
  }
  async getTrendingSymbols(count: number): Promise<YahooSearchResult[]> {
    const { quotes } = await yahooFinance.trendingSymbols('US', { count });
    const symbols = quotes.map(r => r.symbol);

    if (!symbols?.length) {
      return [];
    }

    const results = await (yahooFinance.quote(
      symbols,
      {
        fields: ['regularMarketPrice', 'regularMarketChange', 'shortName'],
      },
      { validateResult: false },
    ) as Promise<QuoteResponseArray>);

    return results.map(r => ({
      regularMarketChange: r.regularMarketChange ?? 0,
      regularMarketPrice: r.regularMarketPrice ?? 0,
      symbol: r.symbol,
      shortname: r.shortName,
    }));
  }

  async getCombineInfo(symbols: string[]) {
    const results = await (yahooFinance.quote(
      symbols,
      {
        fields: ['regularMarketPrice', 'regularMarketChange', 'shortName'],
      },
      { validateResult: false },
    ) as Promise<QuoteResponseArray>);
    return results.map(r => ({
      regularMarketChange: r.regularMarketChange ?? 0,
      regularMarketPrice: r.regularMarketPrice ?? 0,
      symbol: r.symbol,
      shortname: r.shortName,
    }));
  }

  async yahooSearch(q: string): Promise<SearchResponseModel | null> {
    const url = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURI(
      q,
    )}&quotesCount=8&newsCount=0&listsCount=0`;

    try {
      const { data } = await firstValueFrom(this.httpService.get<SearchResponseModel>(url));
      return data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getHistory(symbol: string, target: HistoryPeriodTarget): Promise<HistoricalData> {
    const { interval, range } = this.getPeriodFromTarget2(target);
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURI(symbol)}?interval=${interval}&range=${range}`;
    try {
      const { data } = await firstValueFrom(this.httpService.get<HistoryResponseModel>(url));

      return {
        ...data.chart.result[0].indicators.quote[0],
        symbol,
      };
    } catch (error) {
      console.error(error);
      return {
        symbol,
        close: [],
        high: [],
        low: [],
        open: [],
        volume: [],
      };
    }
  }

  private getPeriodFromTarget2(target: HistoryPeriodTarget) {
    switch (target) {
      case HistoryPeriodTarget.Week:
        return {
          interval: '15m',
          range: '5d',
        };
      case HistoryPeriodTarget.Month:
        return {
          interval: '1h',
          range: '1mo',
        };
      case HistoryPeriodTarget.Year:
        return {
          interval: '1wk',
          range: '1y',
        };
      case HistoryPeriodTarget.FiveYears:
        return {
          interval: '1mo',
          range: '5y',
        };
      case HistoryPeriodTarget.TenYears:
        return {
          interval: '1mo',
          range: 'max',
        };

      case HistoryPeriodTarget.Day:
      default:
        return {
          interval: '2m',
          range: '1d',
        };
    }
  }
}
