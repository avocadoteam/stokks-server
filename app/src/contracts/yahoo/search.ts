import { NewsItem } from '@models';

export type SearchResponseModel = {
  count: number;
  quotes: {
    exchange: string;
    shortname: string;
    quoteType: string;
    symbol: string;
    index: string;
    score: number;
    typeDisp: string;
    longname: string;
    isYahooFinance: boolean;
  }[];
  news: NewsItem[];
};
