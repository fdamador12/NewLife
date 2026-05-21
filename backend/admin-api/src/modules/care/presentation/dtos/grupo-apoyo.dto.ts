import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString, IsOptional, IsUrl, IsEnum, IsNotEmpty, IsArray } from 'class-validator';

/**
 * Opciones para @IsUrl() que permiten URLs sin TLD (como localhost o IPs).
 *
 * Por defecto, class-validator rechaza URLs como "http://localhost:5183/..."
 * porque "localhost" no tiene TLD (.com, .org, etc.). Esto rompe el desarrollo
 * local con MinIO.
 *
 * En producción, las URLs sí tendrán TLD (ej: newlife-media.openlab.uninorte.edu.co),
 * así que esto solo afloja la validación lo justo para que dev y prod funcionen.
 */
const URL_OPTIONS = {
  require_tld: false,
  require_protocol: true, // sigue exigiendo http:// o https://
};

export class CreateGrupoApoyoDto {
  @ApiProperty() @IsString() @IsNotEmpty() nombre!: string;
  @ApiProperty() @IsString() @IsNotEmpty() descripcion!: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() direccion?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() lugar?: string;
  @ApiProperty({ required: false }) @IsString() @IsOptional() email?: string;

  @ApiProperty({ required: false }) @IsUrl(URL_OPTIONS) @IsOptional() sitio_web?: string;
  @ApiProperty({ required: false }) @IsUrl(URL_OPTIONS) @IsOptional() instagram?: string;
  @ApiProperty({ required: false }) @IsUrl(URL_OPTIONS) @IsOptional() facebook?: string;

  @ApiProperty({ type: [String], required: false }) @IsArray() @IsString({ each: true }) @IsOptional() telefonos?: string[];
  @ApiProperty({ type: [String], required: false }) @IsArray() @IsString({ each: true }) @IsOptional() whatsapp?: string[];

  @ApiProperty({ required: false }) @IsUrl(URL_OPTIONS) @IsOptional() comunidad_url?: string;
  @ApiProperty({ required: false }) @IsUrl(URL_OPTIONS) @IsOptional() logo_url?: string;

  @ApiProperty({ enum: ['ACTIVE', 'INACTIVE'] }) @IsEnum(['ACTIVE', 'INACTIVE']) estado!: 'ACTIVE' | 'INACTIVE';
}

export class UpdateGrupoApoyoDto extends PartialType(CreateGrupoApoyoDto) {}