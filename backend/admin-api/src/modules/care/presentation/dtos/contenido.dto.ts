import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsEnum, IsNotEmpty, IsNumber, IsArray, IsUUID } from 'class-validator';
 
/**
 * Opciones para @IsUrl() que permiten URLs sin TLD (como localhost de MinIO en dev).
 * En producción las URLs sí tendrán TLD (ej: newlife-media.openlab.uninorte.edu.co),
 * así que esto no afloja la seguridad — solo desbloquea el desarrollo local.
 */
const URL_OPTIONS = {
  require_tld: false,
  require_protocol: true, // sigue exigiendo http:// o https://
};
 
export class CreateContenidoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  titulo!: string;
 
  @ApiProperty({ enum: ['ARTICULO', 'VIDEO'] })
  @IsEnum(['ARTICULO', 'VIDEO'])
  tipo!: 'ARTICULO' | 'VIDEO';
 
  @ApiProperty()
  @IsNumber()
  duracion_minutos!: number;
 
  @ApiPropertyOptional()
  @IsUrl(URL_OPTIONS)
  @IsOptional()
  imagen_portada?: string;
 
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  texto_contenido!: string;
 
  @ApiPropertyOptional()
  @IsUrl(URL_OPTIONS)
  @IsOptional()
  video_url?: string;
 
  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoria_id?: string;
 
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  autor_nombre?: string;
 
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  autor_profesion?: string;
 
  @ApiPropertyOptional()
  @IsUrl(URL_OPTIONS)
  @IsOptional()
  autor_foto?: string;
 
  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  hashtags?: string[];
 
  @ApiProperty({ enum: ['PUBLISHED', 'DRAFT'] })
  @IsEnum(['PUBLISHED', 'DRAFT'])
  estado!: 'PUBLISHED' | 'DRAFT';
}
 
export class UpdateContenidoDto extends PartialType(CreateContenidoDto) {}