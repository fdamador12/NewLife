import {
  Injectable,
  InternalServerErrorException,
  Logger,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import {
  IMediaStoragePort,
  BucketType,
  UploadFileInput,
  UploadFileResult,
} from '../../domain/ports/media-storage.port';

/**
 * Adapter de MinIO usando el SDK oficial de AWS S3.
 *
 * MinIO es 100% compatible con la API de S3, por lo que el mismo SDK funciona.
 * Si en el futuro migramos a AWS S3 real, Cloudflare R2, etc., solo cambiamos
 * el endpoint y las credenciales — el código de esta clase sigue idéntico.
 */
@Injectable()
export class MinioStorageAdapter implements IMediaStoragePort, OnModuleInit {
  private readonly logger = new Logger(MinioStorageAdapter.name);

  private readonly client: S3Client;
  private readonly publicEndpoint: string;
  private readonly publicBucket: string;

  constructor(private readonly config: ConfigService) {
    const endpoint = this.config.get<string>('MINIO_ENDPOINT');
    const region = this.config.get<string>('MINIO_REGION') ?? 'us-east-1';
    const accessKey = this.config.get<string>('MINIO_ACCESS_KEY');
    const secretKey = this.config.get<string>('MINIO_SECRET_KEY');

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error(
        'Variables de entorno de MinIO faltantes: MINIO_ENDPOINT, MINIO_ACCESS_KEY, MINIO_SECRET_KEY',
      );
    }

    this.publicEndpoint =
      this.config.get<string>('MINIO_PUBLIC_ENDPOINT') ?? endpoint;
    this.publicBucket =
      this.config.get<string>('MINIO_BUCKET_PUBLIC') ?? 'newlife-public';

    this.client = new S3Client({
      endpoint,
      region,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
      forcePathStyle: true, // MinIO requiere path-style en lugar de virtual-hosted-style
    });
  }

  /**
   * Al arrancar el módulo, verifica que el bucket público sea accesible.
   * Si falla, los logs te dirán inmediatamente que hay un problema de conexión/credenciales.
   */
  async onModuleInit(): Promise<void> {
    try {
      const ok = await this.healthCheck('public');
      if (ok) {
        this.logger.log(
          `Conectado a MinIO. Bucket "${this.publicBucket}" accesible.`,
        );
      } else {
        this.logger.error(`Bucket "${this.publicBucket}" no accesible.`);
      }
    } catch (err) {
      this.logger.error(
        `Error al conectar con MinIO: ${(err as Error).message}`,
      );
      // No lanzamos error: dejamos que la app arranque para que puedas debuggear,
      // pero los uploads fallarán hasta que MinIO esté bien configurado.
    }
  }

  async upload(
    bucket: BucketType,
    key: string,
    file: UploadFileInput,
  ): Promise<UploadFileResult> {
    const bucketName = this.resolveBucket(bucket);

    try {
      await this.client.send(
        new PutObjectCommand({
          Bucket: bucketName,
          Key: key,
          Body: file.buffer,
          ContentType: file.mimeType,
          ContentLength: file.size,
          // Cache de 30 días para archivos públicos (las URLs cambian con cada upload por el UUID)
          CacheControl: bucket === 'public' ? 'public, max-age=2592000, immutable' : 'private',
        }),
      );

      return {
        key,
        publicUrl: this.getPublicUrl(bucket, key),
        size: file.size,
        mimeType: file.mimeType,
      };
    } catch (err) {
      this.logger.error(
        `Error al subir "${key}" a "${bucketName}": ${(err as Error).message}`,
      );
      throw new InternalServerErrorException(
        'No se pudo subir el archivo al almacenamiento.',
      );
    }
  }

  async delete(bucket: BucketType, key: string): Promise<void> {
    const bucketName = this.resolveBucket(bucket);

    try {
      await this.client.send(
        new DeleteObjectCommand({
          Bucket: bucketName,
          Key: key,
        }),
      );
    } catch (err) {
      this.logger.error(
        `Error al borrar "${key}" de "${bucketName}": ${(err as Error).message}`,
      );
      throw new InternalServerErrorException(
        'No se pudo borrar el archivo del almacenamiento.',
      );
    }
  }

  /**
   * Construye la URL pública de un archivo.
   * Para el bucket público, esta URL es accesible sin autenticación porque el bucket
   * está configurado con anonymous read (mc anonymous set download).
   */
  getPublicUrl(bucket: BucketType, key: string): string {
    if (bucket !== 'public') {
      throw new Error(
        `getPublicUrl solo aplica a bucket "public". Para bucket privado se requiere URL firmada.`,
      );
    }

    // Limpiamos trailing slash del endpoint para evitar URLs como "http://x:5183//bucket/key"
    const endpoint = this.publicEndpoint.replace(/\/$/, '');
    return `${endpoint}/${this.publicBucket}/${key}`;
  }

  async healthCheck(bucket: BucketType): Promise<boolean> {
    const bucketName = this.resolveBucket(bucket);
    try {
      await this.client.send(new HeadBucketCommand({ Bucket: bucketName }));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Mapea el tipo de bucket conceptual al nombre real en MinIO.
   * Por ahora solo soportamos público; el privado se añadirá cuando llegue la red social.
   */
  private resolveBucket(bucket: BucketType): string {
    if (bucket === 'public') return this.publicBucket;
    throw new Error(
      `Bucket "${bucket}" no implementado todavía. Solo "public" está disponible en esta fase.`,
    );
  }
}