import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsBoolean, IsOptional, IsEnum } from 'class-validator';

export class CreateAgendaEventDto {
  @ApiProperty({ example: 'Visitar la fundación Shalom' })
  @IsString() @IsNotEmpty()
  titulo!: string;

  @ApiProperty({ example: '2026-04-02' })
  @IsString() @IsNotEmpty()
  fecha!: string;

  @ApiProperty({ example: '08:00 am' })
  @IsString() @IsNotEmpty()
  hora_desde!: string;

  @ApiProperty({ example: '09:00 am' })
  @IsString() @IsNotEmpty()
  hora_hasta!: string;

  @ApiProperty({ example: 'FUNDACION' })
  @IsEnum(['REUNION', 'GRUPO_AA', 'FUNDACION', 'LECTURA', 'OTRO'])
  categoria!: string;

  @ApiProperty({ example: 'UNA_VEZ' })
  @IsEnum(['UNA_VEZ', 'DIARIO', 'SEMANAL', 'MENSUAL'])
  repetir!: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  recordatorio!: boolean;

  @ApiProperty({ example: '30_MIN', required: false })
  @IsString() @IsOptional()
  tiempo_recordatorio?: string;
}

export class UpdateAgendaEventDto extends PartialType(CreateAgendaEventDto) {}