import { IsString, IsNotEmpty, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePostDto {
  @IsOptional()
  @IsString()
  @MaxLength(300)
  titulo?: string;
  
  @ApiProperty({ example: '¡Hoy cumplí 30 días sobrio!', maxLength: 2000 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000)
  contenido: string;
}