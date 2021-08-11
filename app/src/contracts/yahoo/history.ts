type ValidRanges = '1d' | '5d' | '1mo' | '3mo' | '6mo' | '1y' | '2y' | '5y' | 'ytd' | 'max';

export type HistoryResponseModel = {
  chart: {
    result: {
      meta: {
        currency: string;
        symbol: string;
        exchangeName: string;
        instrumentType: string;
        firstTradeDate: number;
        regularMarketTime: number;
        gmtoffset: number;
        timezone: string;
        exchangeTimezoneName: string;
        regularMarketPrice: number;
        chartPreviousClose: number;
        previousClose: number;
        scale: number;
        priceHint: number;
        currentTradingPeriod: {
          pre: {
            timezone: string;
            end: number;
            start: number;
            gmtoffset: number;
          };
          regular: {
            timezone: string;
            end: number;
            start: number;
            gmtoffset: number;
          };
          post: {
            timezone: string;
            end: number;
            start: number;
            gmtoffset: number;
          };
        };
        tradingPeriods: [
          [
            {
              timezone: string;
              end: number;
              start: number;
              gmtoffset: number;
            },
          ],
        ];
        dataGranularity: string;
        range: ValidRanges;
        validRanges: ValidRanges[];
      };
      timestamp: number[];
      indicators: {
        quote: [
          {
            volume: number[];
            high: number[];
            open: number[];
            low: number[];
            close: number[];
          },
        ];
      };
    }[];
    error: any | null;
  };
};
