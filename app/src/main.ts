import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import moment from 'moment';
import * as logger from 'morgan';
import { AppModule } from './app.module';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  app.use(logger('tiny'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new TimeoutInterceptor());

  const port = configService.get<number>('core.port', 3000);
  await app.listen(port, () => {
    console.log(moment().format('DD MM YYYY hh:mm:ss'));
    console.log('Server listen on port', port);
  });
}
bootstrap();
