import { Module } from '@nestjs/common';
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
    AuthModule,
    MulterModule.register({
      storage: multer.memoryStorage(),
      limits: { fileSize: 10 * 1024 * 1024, files: 1 },
    }),
  ],
  controllers: [MediaController],
  providers: [MinioService, ImageValidatorService],
})
export class MediaModule {}
