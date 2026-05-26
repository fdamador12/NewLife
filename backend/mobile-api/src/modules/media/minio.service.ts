import { Injectable, InternalServerErrorException, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3Client, PutObjectCommand, HeadBucketCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';

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

  async uploadPostImage(buffer: Buffer, mimeType: string): Promise<string> {
    const key = `posts/${uuidv4()}.webp`;
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
      this.logger.error(`Error subiendo imagen: ${(err as Error).message}`);
      throw new InternalServerErrorException('No se pudo subir la imagen.');
    }
  }
}
