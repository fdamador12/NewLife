import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsISO8601, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  nombre: string;

  @IsOptional()
  @IsISO8601()
  fecha_ultimo_consumo?: string; // ← AGREGAR ESTO
}