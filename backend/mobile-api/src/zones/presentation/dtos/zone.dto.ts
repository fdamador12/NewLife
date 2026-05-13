import { IsNotEmpty, IsString, IsIn } from 'class-validator';

export class CreateZoneDto {
  @IsString() @IsNotEmpty()
  nombre: string;

  @IsString()
  descripcion?: string;

  @IsIn(['risk', 'safe'])
  tipo: 'risk' | 'safe';

  @IsString() @IsNotEmpty()
  latitud: string;

  @IsString() @IsNotEmpty()
  longitud: string;
}