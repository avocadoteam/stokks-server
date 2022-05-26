import { IsBoolean, IsEmail, IsEnum, IsNumber, IsString, MaxLength, MinLength } from 'class-validator';
import {
  NotificationIntervalTarget,
  TriggerParam,
  UserCreateModel,
  UserDeleteStoreModel,
  UserGoogleCreateModel,
  UserNotificationInstallModel,
  UserNotificationModel,
  UserNotificationUpdateModel,
  UserStoreModel,
} from '@models';

import { IsNotBlank } from 'src/interceptors/exts/isBlank';

export class UserStoreDto implements UserStoreModel {
  @IsNumber()
  userId: number;

  @IsString()
  @IsNotBlank()
  symbol: string;
}
export class UserCreateDto implements UserCreateModel {
  @IsString()
  @IsNotBlank()
  @MinLength(8)
  @MaxLength(100)
  password: string;
}
export class UserGooleCreateDto implements UserGoogleCreateModel {
  @IsString()
  @IsNotBlank()
  @MinLength(8)
  id: string;

  @IsString()
  @IsNotBlank()
  @MaxLength(1024)
  @IsEmail()
  email: string;
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

export class UserNotificationInstallDto implements UserNotificationInstallModel {
  @IsString()
  @IsNotBlank()
  token: string;

  @IsString()
  @IsNotBlank()
  device: string;
}
