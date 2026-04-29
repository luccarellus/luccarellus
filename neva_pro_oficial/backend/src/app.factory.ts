import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

export async function createApp() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const configuredOrigins = String(process.env.FRONTEND_ORIGIN || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  const isProd = process.env.NODE_ENV === 'production';
  const defaultDevOrigins = [/^http:\/\/localhost:\d+$/, /^http:\/\/127\.0\.0\.1:\d+$/];

  if (isProd && configuredOrigins.length === 0) {
    throw new Error('FRONTEND_ORIGIN is required in production (comma-separated list).');
  }

  app.enableCors({
    origin: configuredOrigins.length > 0 ? configuredOrigins : defaultDevOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: false,
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin'],
  });
  app.setGlobalPrefix('api/v1');

  const enableSwagger = !isProd || process.env.ENABLE_SWAGGER === 'true';
  if (enableSwagger) {
    const config = new DocumentBuilder()
      .setTitle('ENEM Gamification API')
      .setDescription('The core API for the student portal')
      .setVersion('1.0')
      .addBearerAuth()
      .build();

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('docs', app, document);
  }

  return app;
}
