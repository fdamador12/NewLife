import { IsOptional, IsString, IsUrl, ValidateIf } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para actualizar el avatar del usuario.
 *
 * - Si avatar_url es null o cadena vacia: el avatar se elimina.
 * - Si avatar_url tiene una URL: se actualiza al nuevo valor.
 */
export class UpdateAvatarDto {
  @ApiPropertyOptional({
    example: 'https://minio.example.com/newlife-public/avatars/uuid.webp',
    description: 'URL publica del avatar (obtenida de POST /media/upload-avatar). Null o vacio para eliminar.',
    nullable: true,
  })
  @IsOptional()
  @ValidateIf((_, value) => value !== null && value !== '')
  @IsString()
  @IsUrl()
  avatar_url?: string | null;
}