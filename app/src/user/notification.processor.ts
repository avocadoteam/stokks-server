import { TriggerName } from '@models';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { BusEvent } from 'src/contracts/events/bus';
import { JobData, JobName, JobNames, QueueName } from 'src/contracts/queue';
import { UserNotification } from 'src/db/client/tables/UserNotification';
import { EventBus } from 'src/events/events.bus';
import { resolveCondition } from 'src/triggers';
import { YahooApiService } from 'src/yahoo-api/yahoo-api.service';
import { Repository } from 'typeorm';

@Processor(QueueName.UserPriceNotification)
export class NotificationProcessor {
  private readonly logger = new Logger(NotificationProcessor.name);

  constructor(
    @InjectRepository(UserNotification)
    private un: Repository<UserNotification>,
    private readonly ya: YahooApiService,
  ) {}

  @Process(JobNames[QueueName.UserPriceNotification][JobName.PriceNotification])
  async handleProcess(job: Job<JobData[JobName.PriceNotification]>) {
    this.logger.debug(`Call job ${job.name} with attempt ${job.attemptsMade}`);
    const { notificationId } = job.data;

    const notification = await this.un
      .createQueryBuilder('un')
      .innerJoinAndSelect('un.user', 'ua')
      .innerJoinAndSelect('un.stockSymbol', 'ss')
      .where('un.id = :notificationId and un.triggerName = :triggerName', {
        notificationId,
        triggerName: TriggerName.PriceMatch,
      })
      .getOne();

    if (!notification) {
      await job.remove();
      return;
    }
    const data = await this.ya.getSymbolInfo(notification.stockSymbol.name);

    if (resolveCondition(data.regularMarketPrice, Number(notification.triggerValue), notification.triggerParam)) {
      this.logger.log('send notification to client');
    }

    EventBus.emit(BusEvent.UserChangedNotification, {
      deleted: notification.deleted,
      id: notification.id,
      notifyInterval: notification.notifyInterval,
    });
  }
}
