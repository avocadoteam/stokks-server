import { SymbolGeneralInfo, TriggerName } from '@models';
import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Job } from 'bull';
import { Expo, ExpoPushMessage, ExpoPushTicket } from 'expo-server-sdk';
import { BusEvent } from 'src/contracts/events/bus';
import { JobData, JobName, JobNames, QueueName } from 'src/contracts/queue';
import { ExpoSettings } from 'src/db/client/tables/ExpoSettings';
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
    @InjectRepository(ExpoSettings)
    private es: Repository<ExpoSettings>,
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
      this.expoNotify(notification, data);
    }

    EventBus.emit(BusEvent.UserChangedNotification, {
      deleted: notification.deleted,
      id: notification.id,
      notifyInterval: notification.notifyInterval,
    });
  }

  private async expoNotify(notification: UserNotification, data: SymbolGeneralInfo) {
    let expo = new Expo();
    let messages: ExpoPushMessage[] = [];

    const expoSetting = await this.es.findOneBy({ user: { id: notification.user.id } });
    if (!expoSetting?.token) {
      this.logger.error(`Push token not found`);
      return;
    }
    const token = expoSetting.token.toString('utf8');

    if (!Expo.isExpoPushToken(token)) {
      this.logger.error(`Push token ${token} is not a valid Expo push token`);
      return;
    }

    messages.push({
      to: token,
      sound: 'default',
      body: `Price has been change for ${data.fullExchangeName}. It is now $${data.regularMarketPrice.toFixed(2)}`,
      data: { symbolName: notification.stockSymbol.name, symbolId: notification.stockSymbol.id },
    });

    let chunks = expo.chunkPushNotifications(messages);
    let tickets: ExpoPushTicket[] = [];

    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }

    // Later, after the Expo push notification service has delivered the
    // notifications to Apple or Google (usually quickly, but allow the the service
    // up to 30 minutes when under load), a "receipt" for each notification is
    // created. The receipts will be available for at least a day; stale receipts
    // are deleted.
    //
    // The ID of each receipt is sent back in the response "ticket" for each
    // notification. In summary, sending a notification produces a ticket, which
    // contains a receipt ID you later use to get the receipt.
    //
    // The receipts may contain error codes to which you must respond. In
    // particular, Apple or Google may block apps that continue to send
    // notifications to devices that have blocked notifications or have uninstalled
    // your app. Expo does not control this policy and sends back the feedback from
    // Apple and Google so you can handle it appropriately.
    let receiptIds: string[] = [];
    for (let ticket of tickets) {
      // NOTE: Not all tickets have IDs; for example, tickets for notifications
      // that could not be enqueued will have error information and no receipt ID.
      if ('id' in ticket) {
        receiptIds.push(ticket.id);
      }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);
    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let dataR = receipts[receiptId];
          if (dataR.status === 'ok') {
            continue;
          } else if (dataR.status === 'error') {
            console.error(`There was an error sending a notification: ${dataR.message}`);
            if (dataR.details?.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${dataR.details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  }
}
