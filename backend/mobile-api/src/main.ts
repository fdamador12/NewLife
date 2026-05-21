import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useWebSocketAdapter(new IoAdapter(app));

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS: permitir requests desde la app movil y el frontend web
  // (que incluye el panel admin Y la landing publica con eliminar-cuenta).
  //
  // Si la landing en produccion esta en un dominio distinto, agregalo aqui.
  // Para mas seguridad, considera mover esto a variable de entorno.
  app.enableCors({
    origin: [
      'http://localhost:5182',          // Panel admin / landing local
      'http://10.0.2.2:19000',          // Emulador Android Expo
      'http://172.16.25.222:19000',     // Dispositivo fisico Expo
      // Agregar aqui el dominio de produccion de la landing cuando se despliegue:
      // 'https://newlife.app',
      // 'https://www.newlife.app',
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

  // ✅ Logs de inicio
  console.log('\n');
  console.log('  🚀 Mobile API corriendo en: http://localhost:3000');
  console.log('  📋 Swagger mobile:          http://localhost:3000/api/docs/mobile');
  console.log('\n');
}
bootstrap();