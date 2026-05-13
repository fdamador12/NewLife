import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'Juancho', description: 'Apodo del usuario' })
  @IsOptional()
  @IsString()
  apodo?: string;

  @ApiPropertyOptional({ example: 'él/his', description: 'Pronombre preferido' })
  @IsOptional()
  @IsString()
  pronombre?: string;

  @ApiPropertyOptional({ example: 'Mi familia', description: 'Motivo para mantenerse sobrio' })
  @IsOptional()
  @IsString()
  motivo_sobrio?: string;

  @ApiPropertyOptional({ example: 50000, description: 'Gasto semanal estimado en sustancias' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  gasto_semanal?: number;
}