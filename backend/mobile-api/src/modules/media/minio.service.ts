import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, HeadBucketCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

/**
 * Carpetas permitidas dentro del bucket.
 *
 * Mantenemos un set acotado para evitar que alguien suba archivos a carpetas
 * arbitrarias por accidente.
 */
export type MediaFolder = 'posts' | 'avatars';

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name);
  private readonly client: S3Client;
  private readonly publicEndpoint: string;
  private readonly bucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = config.get<string>('MINIO_ENDPOINT');
    const accessKey = config.get<string>('MINIO_ACCESS_KEY');
    const secretKey = config.get<string>('MINIO_SECRET_KEY');

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error('Variables MinIO faltantes: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY');
    }

    this.publicEndpoint = config.get<string>('MINIO_PUBLIC_ENDPOINT') ?? endpoint;
    this.bucket = config.get<string>('MINIO_BUCKET_PUBLIC') ?? 'newlife-public';

    this.client = new S3Client({
      endpoint,
      region: config.get<string>('MINIO_REGION') ?? 'us-east-1',
      credentials: { accessKeyId: accessKey, secretAccessKey: secretKey },
      forcePathStyle: true,
    });
  }

  async onModuleInit(): Promise<void> {
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: this.bucket }));
      this.logger.log(`MinIO: bucket "${this.bucket}" accesible.`);
    } catch (err) {
      this.logger.error(`MinIO: bucket "${this.bucket}" no accesible: ${(err as Error).message}`);
    }
  }

  /**
   * Sube una imagen procesada a una carpeta concreta del bucket público.
   * Genera un nombre único en `<folder>/<uuid>.webp` para evitar colisiones.
   *
   * @returns URL pública completa del archivo subido.
   */
  async uploadImage(folder: MediaFolder, buffer: Buffer, mimeType: string): Promise<string> {
    const key = `${folder}/${uuidv4()}.webp`;
    try {
      await this.client.send(new PutObjectCommand({
        Bucket: this.bucket,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
        ContentLength: buffer.length,
        CacheControl: 'public, max-age=2592000, immutable',
      }));
      const base = this.publicEndpoint.replace(/\/$/, '');
      return `${base}/${this.bucket}/${key}`;
    } catch (err) {
      this.logger.error(`Error subiendo imagen a "${folder}": ${(err as Error).message}`);
      throw new InternalServerErrorException('No se pudo subir la imagen.');
    }
  }

  /**
   * Wrapper para mantener compatibilidad con código existente que subía posts.
   * Sube a la carpeta `posts/`.
   */
  async uploadPostImage(buffer: Buffer, mimeType: string): Promise<string> {
    return this.uploadImage('posts', buffer, mimeType);
  }

  /**
   * Sube una foto de perfil del usuario a la carpeta `avatars/`.
   */
  async uploadAvatar(buffer: Buffer, mimeType: string): Promise<string> {
    return this.uploadImage('avatars', buffer, mimeType);
  }

  /**
   * Elimina un archivo del bucket dado su URL pública completa.
   * Util para limpiar avatares antiguos cuando se sube uno nuevo.
   * Falla silenciosamente: si no se puede borrar, no rompe el flujo.
   */
  async deleteByUrl(fileUrl: string): Promise<void> {
    try {
      const base = this.publicEndpoint.replace(/\/$/, '');
      const prefix = `${base}/${this.bucket}/`;
      if (!fileUrl.startsWith(prefix)) {
        this.logger.warn(`URL fuera de nuestro bucket, no se borra: ${fileUrl}`);
        return;
      }
      const key = fileUrl.substring(prefix.length);
      if (!key) return;

      await this.client.send(new DeleteObjectCommand({
        Bucket: this.bucket,
        Key: key,
      }));
      this.logger.log(`Archivo eliminado de MinIO: ${key}`);
    } catch (err) {
      this.logger.warn(`No se pudo eliminar archivo de MinIO: ${(err as Error).message}`);
    }
  }
}