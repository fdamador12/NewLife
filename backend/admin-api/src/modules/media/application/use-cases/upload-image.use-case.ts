import { Injectable, Inject, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { MEDIA_STORAGE_PORT } from '../../domain/ports/media-storage.port';
import type { IMediaStoragePort } from '../../domain/ports/media-storage.port';
import { UploadedFile } from '../../domain/entities/uploaded-file.entity';
import { ImageValidatorService } from '../../infrastructure/services/image-validator.service';

/**
 * Categorías válidas para organizar imágenes en el bucket público.
 * Cada categoría se mapea a un "folder" virtual dentro del bucket.
 */
export const ALLOWED_CATEGORIES = [
  'covers', // portadas de contenidos educativos
  'avatars', // avatares de autores
  'banners', // banners de comunidades
  'challenges', // imágenes de retos
  'misc', // genérico (poco común, evitar)
] as const;

export type ImageCategory = (typeof ALLOWED_CATEGORIES)[number];

export interface UploadImageInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
  category: ImageCategory;
}

@Injectable()
export class UploadImageUseCase {
  private readonly logger = new Logger(UploadImageUseCase.name);

  constructor(
    @Inject(MEDIA_STORAGE_PORT)
    private readonly storage: IMediaStoragePort,
    private readonly imageValidator: ImageValidatorService,
  ) {}

  async execute(input: UploadImageInput): Promise<UploadedFile> {
    // 1. Validar y procesar la imagen (redimensionar, strip EXIF, convertir a WebP)
    const processed = await this.imageValidator.validateAndProcess(
      input.buffer,
      input.mimeType,
    );

    // 2. Generar key única para evitar colisiones y ataques de path traversal
    // Estructura: "<categoria>/<uuid>.<extension>"
    // Ejemplo: "covers/8a3c2f1e-...webp"
    const key = `${input.category}/${uuidv4()}.${processed.extension}`;

    // 3. Subir al bucket público
    const result = await this.storage.upload('public', key, {
      buffer: processed.buffer,
      originalName: input.originalName,
      mimeType: processed.mimeType,
      size: processed.size,
    });

    this.logger.log(
      `Imagen subida: ${key} (${(processed.size / 1024).toFixed(1)} KB)`,
    );

    return new UploadedFile({
      key: result.key,
      url: result.publicUrl,
      bucket: 'public',
      mimeType: processed.mimeType,
      size: processed.size,
      width: processed.width,
      height: processed.height,
      uploadedAt: new Date().toISOString(),
    });
  }
}