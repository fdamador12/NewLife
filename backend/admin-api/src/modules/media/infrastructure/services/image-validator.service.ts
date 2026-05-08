import {
  Injectable,
  BadRequestException,
  PayloadTooLargeException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import sharp from 'sharp';

/**
 * Tipos MIME permitidos para upload de imágenes.
 * Validamos el contenido real (magic bytes), no solo la extensión del nombre.
 */
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

/**
 * Resultado del procesamiento de imagen.
 * El buffer ha sido redimensionado, comprimido y se le ha removido la metadata EXIF.
 */
export interface ProcessedImage {
  buffer: Buffer;
  mimeType: string;
  size: number;
  width: number;
  height: number;
  extension: string;
}

/**
 * Servicio responsable de validar y procesar imágenes antes de subirlas.
 *
 * Aplica:
 * - Validación de tipo MIME real (no se fía del nombre del archivo)
 * - Validación de tamaño y dimensiones (mín y máx)
 * - Strip de metadata EXIF (privacidad: elimina GPS, modelo de cámara, etc.)
 * - Redimensionado si excede dimensiones máximas
 * - Conversión a WebP para optimización (30-40% más liviano que JPEG)
 */
@Injectable()
export class ImageValidatorService {
  private readonly logger = new Logger(ImageValidatorService.name);

  private readonly maxFileSizeBytes: number;
  private readonly maxDimension: number;
  private readonly minDimension: number;

  constructor(private readonly config: ConfigService) {
    const maxMB = parseInt(this.config.get<string>('MEDIA_MAX_FILE_SIZE_MB') ?? '5', 10);
    this.maxFileSizeBytes = maxMB * 1024 * 1024;
    this.maxDimension = parseInt(
      this.config.get<string>('MEDIA_MAX_IMAGE_DIMENSION') ?? '4000',
      10,
    );
    this.minDimension = parseInt(
      this.config.get<string>('MEDIA_MIN_IMAGE_DIMENSION') ?? '50',
      10,
    );
  }

  /**
   * Valida y procesa una imagen.
   * @throws BadRequestException si la imagen es inválida
   * @throws PayloadTooLargeException si excede el tamaño máximo
   */
  async validateAndProcess(
    buffer: Buffer,
    declaredMimeType: string,
  ): Promise<ProcessedImage> {
    // 1. Validar tamaño antes de procesar (ahorra CPU)
    if (buffer.length > this.maxFileSizeBytes) {
      throw new PayloadTooLargeException(
        `El archivo excede el tamaño máximo de ${this.maxFileSizeBytes / 1024 / 1024} MB.`,
      );
    }

    // 2. Validar MIME declarado contra lista blanca
    if (!ALLOWED_MIME_TYPES.includes(declaredMimeType as (typeof ALLOWED_MIME_TYPES)[number])) {
      throw new BadRequestException(
        `Tipo de archivo no permitido. Permitidos: ${ALLOWED_MIME_TYPES.join(', ')}`,
      );
    }

    // 3. Validar contenido real con Sharp (lee magic bytes, no se fía del nombre)
    let metadata: sharp.Metadata;
    try {
      metadata = await sharp(buffer).metadata();
    } catch (err) {
      this.logger.warn(`Archivo corrupto o no es imagen: ${(err as Error).message}`);
      throw new BadRequestException('El archivo no es una imagen válida o está corrupto.');
    }

    // 4. Validar que el formato detectado coincide con uno permitido
    const detectedFormat = metadata.format;
    if (!detectedFormat || !['jpeg', 'png', 'webp'].includes(detectedFormat)) {
      throw new BadRequestException(
        `Formato de imagen no soportado: ${detectedFormat ?? 'desconocido'}`,
      );
    }

    // 5. Validar dimensiones
    const { width, height } = metadata;
    if (!width || !height) {
      throw new BadRequestException('No se pudieron determinar las dimensiones de la imagen.');
    }

    if (width < this.minDimension || height < this.minDimension) {
      throw new BadRequestException(
        `La imagen es demasiado pequeña. Mínimo: ${this.minDimension}x${this.minDimension} px.`,
      );
    }

    // 6. Procesar: redimensionar si excede, strip EXIF, convertir a WebP
    let pipeline = sharp(buffer).rotate(); // .rotate() respeta orientación EXIF antes de borrarla

    if (width > this.maxDimension || height > this.maxDimension) {
      pipeline = pipeline.resize({
        width: this.maxDimension,
        height: this.maxDimension,
        fit: 'inside', // mantiene proporciones, no recorta
        withoutEnlargement: true,
      });
    }

    // Convertir a WebP (calidad 85 = excelente balance calidad/tamaño)
    // .webp() implícitamente elimina metadata EXIF/GPS por defecto
    const processedBuffer = await pipeline.webp({ quality: 85 }).toBuffer();
    const processedMetadata = await sharp(processedBuffer).metadata();

    return {
      buffer: processedBuffer,
      mimeType: 'image/webp',
      size: processedBuffer.length,
      width: processedMetadata.width ?? width,
      height: processedMetadata.height ?? height,
      extension: 'webp',
    };
  }
}