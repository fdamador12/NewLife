import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';

// Importamos AdminModule para reutilizar JwtModule, AdminJwtGuard, RolesGuard y TokenBlacklistService
import { AdminModule } from '../admin/admin.module';

// Domain
import { MEDIA_STORAGE_PORT } from './domain/ports/media-storage.port';

// Infrastructure
import { MinioStorageAdapter } from './infrastructure/adapters/minio-storage.adapter';
import { ImageValidatorService } from './infrastructure/services/image-validator.service';

// Application
import { UploadImageUseCase } from './application/use-cases/upload-image.use-case';
import { DeleteImageUseCase } from './application/use-cases/delete-image.use-case';

// Presentation
import { MediaController } from './presentation/controllers/media.controller';

@Module({
  imports: [
    ConfigModule,
    AdminModule, // expone los guards y JwtModule que necesita el controller
    // Multer en memoria (no toca disco). Validación de tamaño la hacemos nosotros con
    // ImageValidatorService para devolver mensajes en español más claros.
    MulterModule.register({
      storage: undefined, // memoryStorage por defecto cuando se omite
      limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB tope absoluto. Nuestro validador aplica el tope real (5 MB).
        files: 1,
      },
    }),
  ],
  controllers: [MediaController],
  providers: [
    {
      provide: MEDIA_STORAGE_PORT,
      useClass: MinioStorageAdapter,
    },
    ImageValidatorService,
    UploadImageUseCase,
    DeleteImageUseCase,
  ],
  exports: [
    // Exportamos el puerto para que otros módulos (care, motivation) puedan usarlo
    // sin acoplarse a MinIO en concreto.
    MEDIA_STORAGE_PORT,
    UploadImageUseCase,
    DeleteImageUseCase,
  ],
})
export class MediaModule {}