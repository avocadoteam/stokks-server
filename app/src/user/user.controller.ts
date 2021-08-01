import { NotificationIntervalTarget } from '@models';
import {
  Body,
  Controller,
  Delete,
  Get,
  HttpStatus,
  NotFoundException,
  ParseIntPipe,
  Post,
  Put,
  Query,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBody, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { TransformInterceptor } from 'src/interceptors/transform.interceptor';
import { UserDeleteStoreDto, UserNotificationDto, UserStoreDto } from './dto/user.dto';
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
    if (!this.us.hasUser(model.userId)) {
      throw new NotFoundException();
    }

    await this.us.fillTheStore(model.userId, model.symbol);
  }

  @ApiResponse({ schema: { example: { data: 'UserStoreItem[]' } }, status: 200 })
  @ApiResponse({ status: 404, description: 'User or store not found' })
  @ApiQuery({ name: 'userId', required: true })
  @Get('store')
  async getUserStore(@Query('userId', new ParseIntPipe({ errorHttpStatusCode: HttpStatus.BAD_REQUEST })) userId: number) {
    if (!this.us.hasUser(userId)) {
      throw new NotFoundException();
    }

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
    if (!this.us.hasUser(model.userId)) {
      throw new NotFoundException();
    }
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
        target: { type: 'enum', enum: [NotificationIntervalTarget] },
      },
    },
  })
  @Post('notification')
  createNotification(@Body() model: UserNotificationDto) {
    if (!this.us.hasUser(model.userId)) {
      throw new NotFoundException();
    }

    return this.us.createNotification(model);
  }
}
