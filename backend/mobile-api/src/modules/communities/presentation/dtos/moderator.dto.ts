import { IsString, IsNotEmpty, IsIn, IsNumber, Min, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChangeAccessDto {
  @ApiProperty({ enum: ['SOLO_VER', 'POSTEAR_COMENTAR', 'CHAT_COMPLETO'] })
  @IsString()
  @IsIn(['SOLO_VER', 'POSTEAR_COMENTAR', 'CHAT_COMPLETO'])
  tipoAcceso: string;
}

export class SuspendMemberDto {
  @ApiProperty({ example: 7, description: 'Días de suspensión' })
  @IsNumber()
  @Min(1)
  dias: number;
}

export class RequestBanDto {
  @ApiProperty({ example: 'roble-user-id-123' })
  @IsString()
  @IsNotEmpty()
  usuario_id: string;

  @ApiProperty({ example: 'Acoso reiterado a miembros de la comunidad' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  motivo: string;
}

export class AddMemberDto {
  @ApiProperty({ example: 'usuario@email.com' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ enum: ['SOLO_VER', 'POSTEAR_COMENTAR', 'CHAT_COMPLETO'], default: 'POSTEAR_COMENTAR' })
  @IsOptional()
  @IsString()
  @IsIn(['SOLO_VER', 'POSTEAR_COMENTAR', 'CHAT_COMPLETO'])
  tipoAcceso?: string;
}

export class ReplyForumDto {
  @ApiProperty({ example: 'Mi estrategia ha sido meditar cada mañana.' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(1000)
  contenido: string;
}