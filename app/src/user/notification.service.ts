import { NotificationIntervalTarget } from '@models';
import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import { BusEvent, UserNotificationEventModel } from 'src/contracts/events/bus';
import { JobData, JobName, JobNames, QueueName } from 'src/contracts/queue';
import { EventBus } from 'src/events/events.bus';
import { dayInMS, hourInMS, monthInMs, weekInMs } from 'src/utils/time';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(@InjectQueue(QueueName.UserPriceNotification) private readonly queue: Queue) {
    this.logger.debug(`Register for ${QueueName.UserPriceNotification}`);
    EventBus.on(BusEvent.UserCreatedNotification, data => {
      this.addToQueue(data);
    });
    EventBus.on(BusEvent.UserChangedNotification, data => {
      this.updateQueue(data);
    });
  }

  private async addToQueue(data: UserNotificationEventModel) {
    const jobData: JobData[JobName.PriceNotification] = { notificationId: data.id };
    await this.queue.add(JobNames[QueueName.UserPriceNotification][JobName.PriceNotification], jobData, {
      delay: this.getDelay(data.notifyInterval),
      jobId: data.id,
    });
  }
  private async updateQueue(data: UserNotificationEventModel) {
    const job = await this.queue.getJob(data.id);
    await job?.remove();
    if (!!data.deleted) {
      return;
    }
    await this.addToQueue(data);
  }

  private getDelay(notifyInterval: NotificationIntervalTarget) {
    switch (notifyInterval) {
      case NotificationIntervalTarget.Daily:
        return dayInMS;
      case NotificationIntervalTarget.Every8Hours:
        return hourInMS * 8;
      case NotificationIntervalTarget.EveryHour:
        return hourInMS;
      case NotificationIntervalTarget.Monthly:
        return monthInMs;
      case NotificationIntervalTarget.Weekly:
        return weekInMs;
    }
  }
}
