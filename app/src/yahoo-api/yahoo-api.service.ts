import { HistoryPeriodTarget, NewsItem, SymbolGeneralInfo, YahooSearchResult } from '@models';
import { Injectable } from '@nestjs/common';
import * as moment from 'moment';
import yahooFinance from 'yahoo-finance2';
import { HistoricalOptions } from 'yahoo-finance2/dist/esm/src/modules/historical';
import { Quote, QuoteResponseArray } from 'yahoo-finance2/dist/esm/src/modules/quote';

@Injectable()
export class YahooApiService {
  async startSearch(query: string): Promise<YahooSearchResult[]> {
    const { Result: autocResults } = await yahooFinance.autoc(query);

    const symbols = autocResults.map(r => r.symbol);

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

    return {
      fullExchangeName: result.fullExchangeName,
      marketCap: result.marketCap ?? 0,
      regularMarketChange: result.regularMarketChange ?? 0,
      regularMarketDayRange: result.regularMarketDayRange ?? { high: 0, low: 0 },
      regularMarketOpen: result.regularMarketOpen ?? 0,
      regularMarketPrice: result.regularMarketPrice ?? 0,
      regularMarketVolume: result.regularMarketVolume ?? 0,
    };
  }

  async getSymbolHistory(symbol: string, target: HistoryPeriodTarget) {
    const history = await yahooFinance.historical(symbol, this.getPeriodFromTarget(target));
    return history;
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

  private getPeriodFromTarget(target: HistoryPeriodTarget): HistoricalOptions {
    switch (target) {
      case HistoryPeriodTarget.Week:
        return {
          period1: moment().subtract(1, 'week').format('YYYY-MM-DD'),
          period2: moment().format('YYYY-MM-DD'),
        };
      case HistoryPeriodTarget.Month:
        return {
          period1: moment().subtract(1, 'month').format('YYYY-MM-DD'),
          period2: moment().format('YYYY-MM-DD'),
        };
      case HistoryPeriodTarget.Year:
        return {
          period1: moment().subtract(1, 'year').format('YYYY-MM-DD'),
          period2: moment().format('YYYY-MM-DD'),
        };
      case HistoryPeriodTarget.FiveYears:
        return {
          period1: moment().subtract(5, 'years').format('YYYY-MM-DD'),
          period2: moment().format('YYYY-MM-DD'),
          interval: '1mo',
        };
      case HistoryPeriodTarget.TenYears:
        return {
          period1: moment().subtract(10, 'years').format('YYYY-MM-DD'),
          period2: moment().format('YYYY-MM-DD'),
          interval: '1mo',
        };

      case HistoryPeriodTarget.Day:
      default:
        return {
          period1: moment().format('YYYY-MM-DD'),
        };
    }
  }
}
