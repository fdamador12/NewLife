import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional } from 'class-validator';

export class CreateCategoriaDto {
  @ApiProperty({ example: 'Control de Impulsos' }) 
  @IsString() 
  @IsNotEmpty() 
  nombre!: string;

  @ApiProperty({ required: false }) 
  @IsString() 
  @IsOptional() 
  descripcion?: string;
}

export class UpdateCategoriaDto extends PartialType(CreateCategoriaDto) {}