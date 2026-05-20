import { AdminModule } from './modules/admin/admin.module';
import { MotivationModule } from './modules/motivation/motivation.module';
import { CareModule } from './modules/care/care.module';
import { MediaModule } from './modules/media/media.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:3002',
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  // ── Swagger panel web ────────────────────────────────────────────────────
  const webConfig = new DocumentBuilder()
    .setTitle('NewLife — Panel de Administración')
    .setDescription('Endpoints del panel web para admins y superadmins')
    .setVersion('1.0')
    .addBearerAuth()
    .addTag('Admin — Auth')
    .addTag('Admin — Frases del Día')
    .addTag('Admin — Retos')
    .addTag('Admin — Grupos de Apoyo')
    .addTag('Admin — Analytics')
    .addTag('Media — Imágenes')
    .build();

  const webDocument = SwaggerModule.createDocument(app, webConfig, {
    include: [
      AdminModule,
      MotivationModule,
      CareModule,
      MediaModule,
      AnalyticsModule,
    ],
  });

  SwaggerModule.setup('api/docs/web', app, webDocument);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`
  🚀 Admin API corriendo en: http://localhost:${port}
  📋 Swagger web:            http://localhost:${port}/api/docs/web
  `);
}

bootstrap();