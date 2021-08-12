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
  news: {
    uuid: string;
    title: string;
    publisher: string;
    link: string;
    providerPublishTime: number;
    type: 'STORY';
  }[];
};
