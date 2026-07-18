import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.use(cookieParser());

  app.enableCors({
    origin: configService.get<string>('corsOrigin'),
    credentials: true,
  });

  app.setGlobalPrefix('api');

  const port = configService.get<number>('port') ?? 3000;
  await app.listen(port);
}
bootstrap();
