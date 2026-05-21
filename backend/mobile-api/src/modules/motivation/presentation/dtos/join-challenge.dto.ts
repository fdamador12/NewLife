import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinChallengeDto {
  @ApiProperty({ description: 'El ID del reto maestro al que se quiere unir (reto_id)' })
  @IsNotEmpty()
  @IsUUID()
  reto_id!: string;
}