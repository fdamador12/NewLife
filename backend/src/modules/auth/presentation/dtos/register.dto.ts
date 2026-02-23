import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, IsNotEmpty, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'user123' })
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty({ example: 'usuario@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'paciente', default: 'paciente' })
  @IsString()
  rol: string;
}