import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsNumber, IsBoolean, IsOptional } from 'class-validator';

export class InitialRegisterDto {
  @ApiProperty({ example: 'Ricardo Alberto' })
  @IsString() @IsNotEmpty()
  apodo: string;

  @ApiProperty({ example: 'Él' })
  @IsString() @IsNotEmpty()
  pronombre: string;

  @ApiProperty({ example: '2026-03-10T02:30:00Z', description: 'Timestamp del último consumo' })
  @IsDateString() @IsNotEmpty()
  ult_fecha_consumo: string;

  @ApiProperty({ example: 'Mi salud y bienestar' })
  @IsString() @IsNotEmpty()
  motivo_sobrio: string;

  @ApiProperty({ example: 50.5 })
  @IsNumber() @IsNotEmpty()
  gasto_semana: number;

  @ApiProperty({ example: 3001234567, description: 'Se guarda como numeric' })
  @IsNotEmpty()
  telefono: number | string;

  @ApiPropertyOptional({ example: true })
  @IsBoolean() @IsOptional()
  reg_lugar_riesgo?: boolean;

  @ApiPropertyOptional({ example: false })
  @IsBoolean() @IsOptional()
  comp_logros_comunid?: boolean;

  @ApiProperty({ example: '08:00:00', description: 'Formato HH:mm:ss' })
  @IsString() @IsNotEmpty()
  moment_motiv: string;
}