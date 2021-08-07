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
  Post,
  Put,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth, ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/auth/guards/jwt.guard';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import {
  UserCreateDto,
  UserDeleteStoreDto,
  UserNotificationDto,
  UserNotificationUpdateDto,
  UserStoreDto,
} from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User operations')
@ApiResponse({ status: 400, description: 'You re sending shit' })
@Controller('api/user')
@ApiBearerAuth()
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly us: UserService) {}

  @ApiResponse({ schema: { example: { data: 'number' } }, status: 200 })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        password: { type: 'string', maxLength: 100, minLength: 8 },
      },
    },
  })
  @Post()
  createUser(@Body() model: UserCreateDto) {
    return this.us.createUser(model.password);
  }

  @ApiResponse({ status: 201 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        userId: { type: 'number' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Put('store')
  async addToUserStore(@Body() model: UserStoreDto) {
    await this.checkUser(model.userId);

    await this.us.fillTheStore(model.userId, model.symbol);
  }

  @ApiResponse({ schema: { example: { data: 'UserStoreItem[]' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User or store not found' })
  @Get(':userId/store')
  async getUserStore(@Param('userId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) userId: number) {
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
        userId: { type: 'number' },
      },
    },
  })
  @UseGuards(JwtAuthGuard)
  @Delete('store')
  async deleteFromUserStore(@Body() model: UserDeleteStoreDto) {
    await this.checkUser(model.userId);

    await this.us.deleteFromTheStore(model.userId, model.symbolId);
  }

  @ApiResponse({ schema: { example: { data: 'number' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        userId: { type: 'number' },
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
  async createNotification(@Body() model: UserNotificationDto) {
    await this.checkUser(model.userId);

    if (await this.us.hasUserNotification(model.userId, model.symbol)) {
      throw new ConflictException();
    }

    return this.us.createNotification(model);
  }

  @ApiResponse({ schema: { example: { data: 'UserNotificationInfo' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User or notification not found' })
  @UseGuards(JwtAuthGuard)
  @Get(':userId/notification/:id')
  async getNotification(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) userId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) notificationId: number,
  ) {
    await this.checkUser(userId);

    return this.us.getNotification(userId, notificationId);
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
  @Put(':userId/notification/:id')
  async updateNotification(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) userId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) notificationId: number,
    @Body() model: UserNotificationUpdateDto,
  ) {
    await this.checkUser(userId);

    return this.us.updateNotification(notificationId, model);
  }

  private async checkUser(userId: number) {
    if (!(await this.us.hasUser(userId))) {
      throw new NotFoundException();
    }
  }
}
