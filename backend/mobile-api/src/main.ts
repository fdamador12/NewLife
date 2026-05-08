import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // CORS para mobile
  app.enableCors({
    origin: ['http://localhost:5182', 'http://10.0.2.2:19000', 'http://172.16.25.222:19000'],
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
  
  // ✅ AGREGAR ESTOS LOGS
  console.log('\n');
  console.log('  🚀 Mobile API corriendo en: http://localhost:3000');
  console.log('  📋 Swagger mobile:          http://localhost:3000/api/docs/mobile');
  console.log('\n');
}
bootstrap();