import {
  NotificationIntervalTarget,
  TriggerParam,
  UserDeleteStoreModel,
  UserNotificationModel,
  UserNotificationUpdateModel,
  UserStoreModel,
} from '@models';
import { IsBoolean, IsEnum, IsNumber, IsString } from 'class-validator';
import { IsNotBlank } from 'src/interceptors/exts/isBlank';

export class UserStoreDto implements UserStoreModel {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotBlank()
  symbol: string;
}
export class UserDeleteStoreDto implements UserDeleteStoreModel {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotBlank()
  symbolId: string;
}

export class UserNotificationDto implements UserNotificationModel {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotBlank()
  symbol: string;

  @IsEnum(NotificationIntervalTarget)
  notifyInterval: NotificationIntervalTarget;

  @IsEnum(TriggerParam)
  triggerParam: TriggerParam;

  @IsString()
  @IsNotBlank()
  triggerValue: string;
}

export class UserNotificationUpdateDto implements UserNotificationUpdateModel {
  @IsEnum(NotificationIntervalTarget)
  notifyInterval: NotificationIntervalTarget;

  @IsBoolean()
  delete: boolean;

  @IsEnum(TriggerParam)
  triggerParam: TriggerParam;

  @IsString()
  @IsNotBlank()
  triggerValue: string;
}
