import { NotificationIntervalTarget, TriggerParam } from '@models';
import {
  Body,
  ConflictException,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserId } from 'src/auth/decorators/userid.decorator';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import {
  UserDeleteStoreDto,
  UserExpoSettingsInstallDto,
  UserExpoSettingsPatchDto,
  UserGooleCreateDto,
  UserNotificationDto,
  UserNotificationUpdateDto,
  UserStoreDto,
} from './dto/user.dto';
import { UserExpoService } from './user-expo.service';
import { UserService } from './user.service';

@ApiTags('User operations')
@ApiResponse({ status: 400, description: 'You re sending shit' })
@Controller('api/user')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly us: UserService, private readonly ues: UserExpoService) {}

  @ApiResponse({ schema: { example: { data: 'number' } }, status: 200 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string', minLength: 8 },
        email: { type: 'string', maxLength: 1024, minLength: 8 },
      },
    },
  })
  @Post('google')
  createGoogleUser(@Body() model: UserGooleCreateDto) {
    return this.us.createGoogleUser(model.email, model.id);
  }

  @ApiResponse({ status: 200 })
  @Delete()
  async deleteUser(@UserId() userId: number) {
    await this.checkUser(userId);

    this.us.deleteUser(userId);
  }

  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Put('store')
  async addToUserStore(@Body() model: UserStoreDto, @UserId() userId: number) {
    await this.checkUser(userId);

    await this.us.fillTheStore(userId, model.symbol);
  }

  @ApiResponse({ schema: { example: { data: 'UserStoreItem[]' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User or store not found' })
  @UseGuards(JwtAuthGuard)
  @Get('store')
  async getUserStore(@UserId() userId: number) {
    await this.checkUser(userId);

    return this.us.getUserStore(userId);
  }

  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbolId: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete('store')
  async deleteFromUserStore(@Body() model: UserDeleteStoreDto, @UserId() userId: number) {
    await this.checkUser(userId);

    await this.us.deleteFromTheStore(userId, model.symbolId);
  }

  @ApiResponse({ schema: { example: { data: 'number' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        triggerParam: { type: 'enum', enum: [TriggerParam] },
        triggerValue: { type: 'string' },
        notifyInterval: { type: 'enum', enum: [NotificationIntervalTarget] },
      },
    },
  })
  @ApiResponse({ schema: { example: { data: 'number' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Notification has already been created' })
  @UseGuards(JwtAuthGuard)
  @Post('notification')
  async createNotification(@Body() model: UserNotificationDto, @UserId() userId: number) {
    await this.checkUser(userId);

    if (await this.us.hasUserNotification(userId, model.symbol)) {
      throw new ConflictException();
    }

    return this.us.createNotification(userId, model);
  }

  @ApiResponse({ schema: { example: { data: 'UserNotificationInfo' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User or notification not found' })
  @UseGuards(JwtAuthGuard)
  @Get('notifications/:symbolId')
  async getNotifications(@UserId() userId: number, @Param('symbolId') symbolId: string) {
    await this.checkUser(userId);

    return this.us.getNotificationBySymbolId(userId, symbolId);
  }

  @ApiResponse({ schema: { example: { data: 'UserNotificationInfo' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User or notification not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        triggerParam: { type: 'enum', enum: [TriggerParam] },
        triggerValue: { type: 'string' },
        notifyInterval: { type: 'enum', enum: [NotificationIntervalTarget] },
        delete: { type: 'boolean' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Put('notification/:id')
  async updateNotification(
    @UserId() userId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) notificationId: number,
    @Body() model: UserNotificationUpdateDto,
  ) {
    await this.checkUser(userId);

    return this.us.updateNotification(userId, notificationId, model);
  }

  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        token: { type: 'string' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Post('notification/expo-settings')
  async Notification(@Body() model: UserExpoSettingsInstallDto, @UserId() userId: number) {
    await this.checkUser(userId);

    this.ues.installNotification(userId, model);
  }

  @ApiResponse({ status: 200 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        enable: { type: 'boolean' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Patch('notification/expo-settings')
  async changeExpoSettings(@Body() model: UserExpoSettingsPatchDto, @UserId() userId: number) {
    await this.checkUser(userId);

    this.ues.patchExpoNotification(userId, model);
  }

  private async checkUser(userId?: number) {
    if (!(await this.us.hasUser(userId))) {
      throw new NotFoundException();
    }
  }
}
