import { IsString, IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddXpDto {
  @ApiProperty({ example: 'checkin', enum: ['checkin', 'sober_day', 'module_complete'] })
  @IsString()
  @IsIn(['checkin', 'sober_day', 'module_complete'])
  action: string;
}