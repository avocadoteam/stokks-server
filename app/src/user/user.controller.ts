import { NotificationIntervalTarget } from '@models';
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
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { UserDeleteStoreDto, UserNotificationDto, UserNotificationUpdateDto, UserStoreDto } from './dto/user.dto';
import { UserService } from './user.service';

@ApiTags('User operations')
@ApiResponse({ status: 400, description: 'You re sending shit' })
@Controller('api/user')
@UseInterceptors(TransformInterceptor)
export class UserController {
  constructor(private readonly us: UserService) {}

  @ApiResponse({ schema: { example: { data: 'number' } }, status: 200 })
  @Post()
  createUser() {
    return this.us.createUser();
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
  @Put('store')
  async addToUserStore(@Body() model: UserStoreDto) {
    await this.checkUser(model.userId);

    await this.us.fillTheStore(model.userId, model.symbol);
  }

  @ApiResponse({ schema: { example: { data: 'UserStoreItem[]' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User or store not found' })
  @Get('store')
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
        priceMatch: { type: 'number' },
        notifyInterval: { type: 'enum', enum: [NotificationIntervalTarget] },
      },
    },
  })
  @ApiResponse({ schema: { example: { data: 'number' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 409, description: 'Notification has already been created' })
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
        priceMatch: { type: 'number' },
        notifyInterval: { type: 'enum', enum: [NotificationIntervalTarget] },
        delete: { type: 'boolean' },
      },
    },
  })
  @Put(':userId/notification/:id')
  async updateNotification(
    @Param('userId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) userId: number,
    @Param('id', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) notificationId: number,
    @Body() model: UserNotificationUpdateDto,
  ) {
    await this.checkUser(userId);

    return this.us.updateNotification(userId, notificationId, model);
  }

  private async checkUser(userId: number) {
    if (!(await this.us.hasUser(userId))) {
      throw new NotFoundException();
    }
  }
}
