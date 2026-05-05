import { IsString, IsIn, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AddXpDto {
  @ApiProperty({ example: 'checkin', enum: ['checkin', 'sober_day', 'module_complete'] })
  @IsString()
  @IsIn(['checkin', 'sober_day', 'module_complete'])
  action: string;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  nivel?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @IsNumber()
  subnivel?: number;
}