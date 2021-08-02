import { QueueName } from './queue-names';
export enum JobName {
  PriceNotification = 'price_notification',
}

type JobNames = {
  [QueueName.UserPriceNotification]: {
    [JobName.PriceNotification]: `job_${JobName.PriceNotification}`;
  };
};

export const JobNames: JobNames = {
  [QueueName.UserPriceNotification]: {
    [JobName.PriceNotification]: 'job_price_notification',
  },
};
