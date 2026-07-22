import 'dotenv/config';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { COVERS_DIR, ensureUploadDirs } from './reports/storage.util';

async function bootstrap() {
  ensureUploadDirs();
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({ origin: true, credentials: true });
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useStaticAssets(COVERS_DIR, { prefix: '/uploads/covers' });
  await app.listen(process.env.BACKEND_PORT ? Number(process.env.BACKEND_PORT) : 4000);
}

bootstrap();
