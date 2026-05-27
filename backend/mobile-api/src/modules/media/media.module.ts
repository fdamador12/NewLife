import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { AuthModule } from '../auth/auth.module';
import { MinioService } from './minio.service';
import { ImageValidatorService } from './image-validator.service';
import { MediaController } from './media.controller';

@Module({
  imports: [
    ConfigModule,
    // forwardRef porque hay ciclo: MediaModule -> AuthModule -> UsersModule -> MediaModule
    // (UsersModule importa MediaModule para que UpdateAvatarUseCase pueda borrar
    // avatares antiguos via MinioService).
    forwardRef(() => AuthModule),
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    }),
  ],
  controllers: [MediaController],
  providers: [MinioService, ImageValidatorService],
  // MinioService se exporta para que otros modulos (ej. UsersModule para borrar
  // avatares antiguos) puedan inyectarlo sin necesidad de duplicar config.
  exports: [MinioService],
})
export class MediaModule {}