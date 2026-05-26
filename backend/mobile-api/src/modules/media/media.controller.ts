import {
  Controller, Post, Get, UseGuards, UseInterceptors,
  UploadedFile, BadRequestException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/presentation/guards/jwt-auth.guard';
import { MinioService } from './minio.service';
import { ImageValidatorService } from './image-validator.service';

interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@ApiTags('Media')
@Controller('media')
export class MediaController {
  private readonly logger = new Logger(MediaController.name);

  constructor(
    private readonly minioService: MinioService,
    private readonly imageValidator: ImageValidatorService,
  ) {}

  @Get('ping')
  @ApiOperation({ summary: 'Health check sin autenticación' })
  ping() {
    return { ok: true, ts: new Date().toISOString() };
  }

  @Post('upload')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Subir imagen para un post (jpeg, png, webp — máx 5 MB)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
      },
      required: ['file'],
    },
  })
  async upload(@UploadedFile() file: MulterFile) {
    this.logger.log(`[upload] llamado. file=${file ? `${file.originalname} ${file.mimetype} ${file.size}B buffer=${file.buffer?.length ?? 'undefined'}` : 'undefined'}`);

    if (!file) {
      throw new BadRequestException('Debe enviar un archivo en el campo "file".');
    }

    this.logger.log('[upload] validando y procesando imagen...');
    const processed = await this.imageValidator.validateAndProcess(file.buffer, file.mimetype);
    this.logger.log(`[upload] imagen procesada: ${processed.size}B ${processed.mimeType}`);

    this.logger.log('[upload] subiendo a MinIO...');
    const url = await this.minioService.uploadPostImage(processed.buffer, processed.mimeType);
    this.logger.log(`[upload] subida exitosa: ${url}`);

    return { url };
  }
}
