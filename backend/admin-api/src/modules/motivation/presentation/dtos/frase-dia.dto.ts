import { IsString, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFraseDiaDto {
  @ApiProperty({
    example: 'Hoy es un nuevo día para comenzar de nuevo.',
    description: 'Texto de la frase motivacional',
  })
  @IsString()
  frase!: string;

  @ApiProperty({
    example: '2026-04-16',
    description: 'Fecha para la cual aplica la frase (YYYY-MM-DD)',
  })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  dia!: string;
}

export class UpdateFraseDiaDto {
  @ApiPropertyOptional({ example: 'Nuevo texto de la frase...' })
  @IsOptional()
  @IsString()
  frase?: string;

  @ApiPropertyOptional({ example: '2026-04-17' })
  @IsOptional()
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  dia?: string;
}

// DTO para la carga masiva
export class CreateFraseDiaBulkDto {
  @ApiProperty({
    type: [CreateFraseDiaDto],
    description: 'Lista de frases a crear masivamente',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateFraseDiaDto) // Esto es vital para que valide cada objeto por dentro
  frases!: CreateFraseDiaDto[];
}