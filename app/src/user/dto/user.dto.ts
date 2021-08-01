import {
  NotificationIntervalTarget,
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
  target: NotificationIntervalTarget;

  @IsNumber()
  priceMatch: number;
}

export class UserNotificationUpdateDto implements UserNotificationUpdateModel {
  @IsEnum(NotificationIntervalTarget)
  target: NotificationIntervalTarget;

  @IsNumber()
  priceMatch: number;

  @IsBoolean()
  delete: boolean;
}
