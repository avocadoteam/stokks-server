import { JobName } from './job-names';

export type JobData = {
  [JobName.PriceNotification]: { notificationId: number };
  [JobName.GetImgFromArticle]: { url: string };
};
