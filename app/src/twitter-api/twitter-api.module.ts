import { Module } from '@nestjs/common';
import { TwitterApiService } from './twitter-api.service';

@Module({
  controllers: [],
  providers: [TwitterApiService],
  exports: [TwitterApiService],
})
export class TwitterApiModule {}
