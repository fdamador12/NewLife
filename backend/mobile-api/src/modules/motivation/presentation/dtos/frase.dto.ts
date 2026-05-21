import { IsNotEmpty, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class FraseActionDto {
  @ApiProperty({
    description: 'El ID único (UUID) de la frase del día que se desea guardar',
    example: '550e8400-e29b-41d4-a716-446655440000'
  })
  @IsNotEmpty()
  @IsUUID()
  frase_id: string;
}