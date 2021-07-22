import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as moment from 'moment';
import * as logger from 'morgan';
import { join } from 'path';
import { AppModule } from './app.module';
import { TimeoutInterceptor } from './interceptors/timeout.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { cors: true });
  const configService = app.get(ConfigService);
  app.use(logger('tiny'));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );
  app.useGlobalInterceptors(new TimeoutInterceptor());
  app.useStaticAssets(join(__dirname, '../../..', 'public'));
  const port = configService.get<number>('core.port', 3000);
  await app.listen(port, () => {
    console.log(moment().format('DD MM YYYY hh:mm:ss'));
    console.log('Server listen on port', port, 'in', process.env.NODE_ENV, 'mode');
  });
}
bootstrap();
