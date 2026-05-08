import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsDateString, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateForoDiaDto {
  @ApiProperty({ example: '¿Qué es lo que más te motiva a seguir adelante hoy?' })
  @IsString()
  @IsNotEmpty()
  pregunta!: string;

  @ApiPropertyOptional({ example: 'Comparte con la comunidad tus fuentes de inspiración...' })
  @IsString()
  @IsOptional()
  descripcion?: string;

  @ApiProperty({ example: '2026-05-15', description: 'Fecha para el foro (YYYY-MM-DD)' })
  @IsDateString({}, { message: 'La fecha debe tener formato YYYY-MM-DD' })
  @IsNotEmpty()
  fecha!: string;
}

export class UpdateForoDiaDto extends PartialType(CreateForoDiaDto) {}

export class CreateForoDiaBulkDto {
  @ApiProperty({ type: [CreateForoDiaDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateForoDiaDto)
  foros!: CreateForoDiaDto[];
}