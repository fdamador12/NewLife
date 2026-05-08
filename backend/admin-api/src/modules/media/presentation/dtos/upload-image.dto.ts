import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { ALLOWED_CATEGORIES } from '../../application/use-cases/upload-image.use-case';
import type { ImageCategory } from '../../application/use-cases/upload-image.use-case';

export class UploadImageDto {
  @ApiProperty({
    enum: ALLOWED_CATEGORIES,
    description: 'Categoría que organiza la imagen dentro del bucket',
    example: 'covers',
  })
  @IsEnum(ALLOWED_CATEGORIES, {
    message: `La categoría debe ser una de: ${ALLOWED_CATEGORIES.join(', ')}`,
  })
  @IsNotEmpty()
  category!: ImageCategory;
}