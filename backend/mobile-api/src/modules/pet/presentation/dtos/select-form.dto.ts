import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SelectFormDto {
  @ApiProperty({ example: 'flower_azucena' })
  @IsString()
  form: string;
}