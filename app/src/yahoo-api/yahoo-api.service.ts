import { SymbolGeneralInfo, YahooSearchResult } from '@models';
import { Injectable } from '@nestjs/common';
import { brokenSymbol } from 'src/contracts/yahoo';
import yahooFinance from 'yahoo-finance2';
import { Quote, QuoteResponseArray } from 'yahoo-finance2/dist/esm/src/modules/quote';

@Injectable()
export class YahooApiService {
  async startSearch(query: string): Promise<YahooSearchResult[]> {
    const { Result: autocResults } = await yahooFinance.autoc(query);

    const symbols = autocResults.map(r => r.symbol).filter(s => s !== brokenSymbol);

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

  async getSymbolHistory(symbol: string) {
    const history = await yahooFinance.historical(symbol, { period1: '2021-07-27' });
    return history;
  }
}
