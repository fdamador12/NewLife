import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsObject,
  IsOptional,
  IsString,
  Length,
  MaxLength,
} from 'class-validator';

/**
 * Payload para registrar un evento de analytics.
 *
 * Note que NO incluimos `user_id` aquí: ese se extrae del JWT del usuario
 * autenticado (req.user.uid) en el controller. El cliente NUNCA puede
 * mandar un user_id arbitrario.
 *
 * `event_category` tampoco se manda: se asigna automáticamente en backend
 * según el `event_type` (ver EVENT_TYPE_TO_CATEGORY).
 */
export class TrackEventDto {
  @ApiProperty({
    description: 'Tipo del evento. Debe estar en la lista blanca.',
    example: 'sos_triggered',
  })
  @IsString()
  @Length(3, 60)
  event_type!: string;

  @ApiPropertyOptional({
    description: 'ID de sesión que agrupa eventos consecutivos del usuario.',
    example: 'sess_8a3c2f1e9b5d',
  })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  session_id?: string;

  @ApiPropertyOptional({
    description: 'Versión de la app cliente.',
    example: '1.0.0',
  })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  app_version?: string;

  @ApiPropertyOptional({
    description:
      'Datos adicionales del evento (ej: { content_id: "abc", source: "home" }).',
    example: { source: 'home_button' },
  })
  @IsOptional()
  @IsObject()
  properties?: Record<string, unknown>;
}