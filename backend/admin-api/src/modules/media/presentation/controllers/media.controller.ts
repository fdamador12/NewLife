import {
  Controller,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiPayloadTooLargeResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiParam,
} from '@nestjs/swagger';

import { AdminJwtGuard } from '../../../admin/presentation/guards/admin-jwt.guard';
import { Roles, RolesGuard } from '../../../admin/presentation/guards/roles.guard';
import { UserRole } from '../../../admin/domain/entities/admin-user.entity';

import { UploadImageUseCase } from '../../application/use-cases/upload-image.use-case';
import { DeleteImageUseCase } from '../../application/use-cases/delete-image.use-case';
import { UploadImageDto } from '../dtos/upload-image.dto';

/**
 * Estructura mínima de un archivo subido vía multipart.
 * Definimos esta interfaz local para evitar depender del namespace Express.Multer
 * que requiere @types/multer cargado globalmente.
 */
interface MulterFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

@ApiTags('Media — Imágenes')
@ApiBearerAuth()
@UseGuards(AdminJwtGuard, RolesGuard)
@Controller('api/web/media')
export class MediaController {
  constructor(
    private readonly uploadImageUseCase: UploadImageUseCase,
    private readonly deleteImageUseCase: DeleteImageUseCase,
  ) {}

  // ── POST /api/web/media/upload ──────────────────────────────────────────
  @Post('upload')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Subir una imagen al bucket público (portadas, avatares, banners)',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Archivo de imagen (jpeg, png, webp). Máx. 5 MB.',
        },
        category: {
          type: 'string',
          enum: ['covers', 'avatars', 'banners', 'challenges', 'misc'],
          example: 'covers',
        },
      },
      required: ['file', 'category'],
    },
  })
  @ApiCreatedResponse({
    description: 'Imagen subida correctamente.',
    schema: {
      example: {
        key: 'covers/8a3c2f1e-9b5d-4f8a-bc2e-1d7e6f3a9b2c.webp',
        url: 'http://localhost:5183/newlife-public/covers/8a3c...webp',
        bucket: 'public',
        mimeType: 'image/webp',
        size: 124850,
        width: 1280,
        height: 720,
        uploadedAt: '2026-05-06T15:30:00.000Z',
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Archivo inválido o categoría no permitida.' })
  @ApiPayloadTooLargeResponse({ description: 'El archivo excede el tamaño máximo.' })
  @ApiForbiddenResponse({ description: 'Solo admins pueden subir imágenes.' })
  async upload(
    @UploadedFile() file: MulterFile,
    @Body() dto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('Debe enviar un archivo en el campo "file".');
    }

    return this.uploadImageUseCase.execute({
      buffer: file.buffer,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      category: dto.category,
    });
  }

  // ── DELETE /api/web/media/:category/:filename ───────────────────────────
  // Usamos dos params para que la key completa "covers/abc.webp" sea explícita en la URL
  @Delete(':category/:filename')
  @Roles(UserRole.ADMIN, UserRole.SUPERADMIN)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Borrar una imagen del bucket público' })
  @ApiParam({
    name: 'category',
    enum: ['covers', 'avatars', 'banners', 'challenges', 'misc'],
  })
  @ApiParam({
    name: 'filename',
    description: 'Nombre del archivo (UUID + extensión)',
    example: '8a3c2f1e-9b5d-4f8a-bc2e-1d7e6f3a9b2c.webp',
  })
  @ApiOkResponse({ description: 'Imagen borrada correctamente.' })
  @ApiBadRequestResponse({ description: 'Key inválida.' })
  @ApiForbiddenResponse({ description: 'Solo admins pueden borrar imágenes.' })
  async delete(
    @Param('category') category: string,
    @Param('filename') filename: string,
  ) {
    const key = `${category}/${filename}`;
    await this.deleteImageUseCase.execute(key);
    return { message: 'Imagen eliminada exitosamente.' };
  }
}