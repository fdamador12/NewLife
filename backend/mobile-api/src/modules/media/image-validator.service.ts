import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sharp from 'sharp';

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  size: number;
  extension: string;
}

@Injectable()
export class ImageValidatorService {
  private readonly maxFileSizeBytes: number;
  private readonly maxDimension: number;
  private readonly minDimension: number;

  constructor(private readonly config: ConfigService) {
    const maxMB = parseInt(config.get<string>('MEDIA_MAX_FILE_SIZE_MB') ?? '5', 10);
    this.maxFileSizeBytes = maxMB * 1024 * 1024;
    this.maxDimension = parseInt(config.get<string>('MEDIA_MAX_IMAGE_DIMENSION') ?? '2000', 10);
    this.minDimension = parseInt(config.get<string>('MEDIA_MIN_IMAGE_DIMENSION') ?? '50', 10);
  }

  async validateAndProcess(buffer: Buffer, declaredMimeType: string): Promise<ProcessedImage> {
    if (!buffer) {
      throw new BadRequestException('No se recibió el contenido del archivo.');
    }
    if (buffer.length > this.maxFileSizeBytes) {
      throw new PayloadTooLargeException(
        `El archivo excede el tamaño máximo de ${this.maxFileSizeBytes / 1024 / 1024} MB.`,
      );
    }

    if (!ALLOWED_MIME_TYPES.includes(declaredMimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new BadRequestException(
        `Tipo no permitido. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch {
      throw new BadRequestException('El archivo no es una imagen válida o está corrupto.');
    }

    const detectedFormat = metadata.format;
    if (!detectedFormat || !['jpeg', 'png', 'webp'].includes(detectedFormat)) {
      throw new BadRequestException(`Formato no soportado: ${detectedFormat ?? 'desconocido'}`);
    }

    const { width, height } = metadata;
    if (!width || !height) {
      throw new BadRequestException('No se pudieron determinar las dimensiones de la imagen.');
    }

    if (width < this.minDimension || height < this.minDimension) {
      throw new BadRequestException(
        `Imagen demasiado pequeña. Mínimo: ${this.minDimension}x${this.minDimension} px.`,
      );
    }

    let pipeline = sharp(buffer).rotate();

    if (width > this.maxDimension || height > this.maxDimension) {
      pipeline = pipeline.resize({
        width: this.maxDimension,
        height: this.maxDimension,
        fit: 'inside',
        withoutEnlargement: true,
      });
    }

    const processedBuffer = await pipeline.webp({ quality: 85 }).toBuffer();

    return {
      buffer: processedBuffer,
      mimeType: 'image/webp',
      size: processedBuffer.length,
      extension: 'webp',
    };
  }
}
