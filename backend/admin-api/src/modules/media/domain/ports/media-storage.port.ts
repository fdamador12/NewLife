/**
 * Token para inyección de dependencias del puerto de almacenamiento.
 * Usado con @Inject(MEDIA_STORAGE_PORT) para resolver la implementación concreta.
 */
export const MEDIA_STORAGE_PORT = 'MEDIA_STORAGE_PORT';

/**
 * Tipos de bucket disponibles en el sistema.
 * - public: contenido visible sin autenticación (portadas, avatares de autores, banners)
 * - private: contenido protegido vía URLs firmadas (futuras imágenes de la red social)
 */
export type BucketType = 'public' | 'private';

/**
 * Datos de un archivo subido por un cliente HTTP.
 * Coincide con el shape de Express.Multer.File para evitar acoplamiento con la librería.
 */
export interface UploadFileInput {
  buffer: Buffer;
  originalName: string;
  mimeType: string;
  size: number;
}

/**
 * Resultado de una operación de upload exitosa.
 */
export interface UploadFileResult {
  /** Identificador único del archivo en el bucket (incluye prefijo + UUID + extensión). */
  key: string;
  /** URL accesible públicamente (solo para buckets public). */
  publicUrl: string;
  /** Tamaño en bytes después del procesamiento. */
  size: number;
  /** Tipo MIME final (puede diferir del original si hubo conversión). */
  mimeType: string;
}

/**
 * Puerto (interfaz) del almacenamiento de media.
 *
 * Define el contrato que cualquier proveedor de almacenamiento debe cumplir.
 * Esto permite cambiar de MinIO a S3, Cloudinary, etc. sin tocar la lógica de negocio.
 */
export interface IMediaStoragePort {
  /**
   * Sube un archivo al bucket especificado.
   * @param bucket Tipo de bucket destino
   * @param key Nombre/ruta del archivo dentro del bucket
   * @param file Datos del archivo a subir
   */
  upload(bucket: BucketType, key: string, file: UploadFileInput): Promise<UploadFileResult>;

  /**
   * Borra un archivo del bucket.
   * @param bucket Tipo de bucket
   * @param key Nombre/ruta del archivo a borrar
   */
  delete(bucket: BucketType, key: string): Promise<void>;

  /**
   * Genera la URL pública de un archivo (solo para buckets public).
   * @param bucket Tipo de bucket
   * @param key Nombre/ruta del archivo
   */
  getPublicUrl(bucket: BucketType, key: string): string;

  /**
   * Verifica que el bucket exista y sea accesible.
   * Útil al arrancar el backend para fallar rápido si la config está mal.
   */
  healthCheck(bucket: BucketType): Promise<boolean>;
}