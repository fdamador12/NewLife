import { IsEmail, IsString, MinLength, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

/**
 * DTO para solicitar eliminacion de cuenta desde la landing publica.
 *
 * Requiere email + password para verificar identidad antes de borrar.
 * Sin password, cualquiera con el email de otro usuario podria borrar
 * su cuenta.
 *
 * El motivo es opcional y se loguea para analisis futuro.
 */
export class RequestAccountDeletionDto {
  @ApiProperty({
    description: 'Correo electronico de la cuenta a eliminar',
    example: 'usuario@ejemplo.com',
  })
  @IsEmail({}, { message: 'El correo no es valido' })
  email!: string;

  @ApiProperty({
    description: 'Contrasena actual de la cuenta para verificar identidad',
    example: 'MiPassword123',
  })
  @IsString()
  @MinLength(1, { message: 'La contrasena es requerida' })
  password!: string;

  @ApiPropertyOptional({
    description: 'Motivo opcional de la eliminacion (para retroalimentacion)',
    example: 'Ya no la necesito',
  })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: 'El motivo es muy largo (max 500 caracteres)' })
  motivo?: string;
}