import { NotificationIntervalTarget } from '@models';

export enum BusEvent {
  UserChangedNotification = 'user_changed_notification',
  UserCreatedNotification = 'user_created_notification',
}

export type UserNotificationEventModel = { notifyInterval: NotificationIntervalTarget; deleted: Date | null; id: number };

export type BusEventDto = {
  [BusEvent.UserChangedNotification]: UserNotificationEventModel;
  [BusEvent.UserCreatedNotification]: UserNotificationEventModel;
};
