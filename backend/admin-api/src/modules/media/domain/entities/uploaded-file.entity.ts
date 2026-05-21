/**
 * Representa un archivo subido al sistema de almacenamiento.
 * Es el resultado conceptual de una operación de upload.
 */
export class UploadedFile {
  /** Identificador único del archivo dentro del bucket (ej: "covers/abc-def-123.webp") */
  key!: string;

  /** URL pública accesible para mostrar el archivo */
  url!: string;

  /** Tipo de bucket donde está alojado */
  bucket!: 'public' | 'private';

  /** Tipo MIME del archivo (ej: "image/webp") */
  mimeType!: string;

  /** Tamaño en bytes */
  size!: number;

  /** Ancho en píxeles (solo para imágenes) */
  width?: number;

  /** Alto en píxeles (solo para imágenes) */
  height?: number;

  /** Fecha de subida en formato ISO */
  uploadedAt!: string;

  constructor(partial: Partial<UploadedFile>) {
    Object.assign(this, partial);
  }
}