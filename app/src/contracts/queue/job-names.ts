import { QueueName } from './queue-names';
export enum JobName {
  PriceNotification = 'price_notification',

  GetImgFromArticle = 'get_img_from_article',
}

type JobNames = {
  [QueueName.UserPriceNotification]: {
    [JobName.PriceNotification]: `job_${JobName.PriceNotification}`;
  };
  [QueueName.ArticleParse]: {
    [JobName.GetImgFromArticle]: `job_${JobName.GetImgFromArticle}`;
  };
};

export const JobNames: JobNames = {
  [QueueName.UserPriceNotification]: {
    [JobName.PriceNotification]: 'job_price_notification',
  },
  [QueueName.ArticleParse]: {
    [JobName.GetImgFromArticle]: 'job_get_img_from_article',
  },
};
