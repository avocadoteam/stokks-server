import { YahooSearchResult } from '@models';
import { Injectable, Logger } from '@nestjs/common';
import { brokenSymbol } from 'src/contracts/yahoo';
import yahooFinance from 'yahoo-finance2';

@Injectable()
export class YahooApiService {
  private readonly logger = new Logger(YahooApiService.name);

  async startSearch(query: string): Promise<YahooSearchResult[]> {
    const { Result: autocResults } = await yahooFinance.autoc(query);

    const symbols = autocResults.map(r => r.symbol).filter(s => s !== brokenSymbol);
    this.logger.log(symbols);
    const results = await yahooFinance.quote(symbols, {
      fields: ['regularMarketPrice', 'regularMarketChange', 'postMarketChange', 'shortName', 'longName'],
    });
    return results.map(r => ({
      regularMarketChange: r.regularMarketChange ?? 0,
      regularMarketPrice: r.regularMarketPrice ?? 0,
      symbol: r.symbol,
      shortname: r.shortName,
      longname: r.longName,
    }));
  }
}
