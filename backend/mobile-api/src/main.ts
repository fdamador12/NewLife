import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as express from 'express';
import { AppModule } from './app.module';

async function bootstrap() {
  // bodyParser: false — we add our own parsers with a 15 MB limit so the json()
  // middleware never destroys the TCP stream when a large multipart body arrives
  // with the wrong Content-Type (which body-parser's default 100 kb limit would do).
  const app = await NestFactory.create(AppModule, { bodyParser: false });

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS — origins permitidos para llamadas desde browsers.
  //
  // Nota: el APK movil NO necesita CORS (las apps nativas no aplican esa
  // politica). CORS solo importa para llamadas desde el frontend web.
  //
  // FIX 2026-05: agregar dominios de produccion para que el formulario
  // publico de eliminar-cuenta funcione desde la web.
  app.enableCors({
    origin: [
      // Dev local
      'http://localhost:5182',
      'http://10.0.2.2:19000',
      'http://172.16.25.222:19000',
      // Produccion OpenLab
      'https://newlife.openlab.uninorte.edu.co',
    ],
    credentials: true,
  });

  const config = new DocumentBuilder()
    .setTitle('NewLife Mobile API')
    .setDescription('Backend Mobile - Apoyo Post-Rehabilitación')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs/mobile', app, document);

  await app.listen(3000);

  console.log('\n');
  console.log('  🚀 Mobile API corriendo en: http://localhost:3000');
  console.log('  📋 Swagger mobile:          http://localhost:3000/api/docs/mobile');
  console.log('\n');
}
bootstrap();