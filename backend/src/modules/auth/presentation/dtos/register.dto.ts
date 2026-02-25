import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'vane_diaz' })
  @IsString()
  username: string;

  @ApiProperty({ example: 'usuario@gmail.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'NewLife_2026!' })
  @IsString()
  @MinLength(8)
  password: string;
}