import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { AppModule } from './app.module.ts';

/**
 * Application bootstrap.
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get config service
  const configService = app.get(ConfigService);

  // Enable CORS for frontend communication
  app.enableCors({
    origin: configService.get<string>('app.frontendUrl'),
    credentials: true,
  });

  const port = configService.get<number>('app.port');
  await app.listen(port);

  console.log(`🚀 Backend server running on http://localhost:${port}`);
  console.log(`📡 Chat API available at http://localhost:${port}/api/chat`);
}

bootstrap();
