import {
  IsString,
  IsNumber,
  IsBoolean,
  IsArray,
  IsOptional,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class MigrateGuestProfileDto {
  @IsString()
  apodo: string;

  @IsString()
  pronombre: string;

  @IsString()
  ult_fecha_consumo: string;

  @IsString()
  motivo_sobrio: string;

  @IsNumber()
  gasto_semana: number;

  @IsNumber()
  telefono: number;

  @IsBoolean()
  reg_lugar_riesgo: boolean;

  @IsBoolean()
  comp_logros_comunid: boolean;

  @IsString()
  moment_motiv: string;

  @IsOptional()
  @IsString()
  nombre_contacto?: string;
}

export class MigrateGuestSobrietyDto {
  @IsString()
  startDate: string;
}

export class MigrateGuestContactDto {
  @IsString()
  id: string;

  @IsString()
  nombre: string;

  @IsString()
  telefono: string;
}

export class MigrateGuestCheckinDto {
  @IsString()
  fecha: string;

  @IsString()
  emocion: string;

  @IsBoolean()
  consumo: boolean;

  @IsString()
  gratitud: string;

  @IsOptional()
  @IsString()
  ubicacion?: string;

  @IsOptional()
  @IsString()
  social?: string;

  @IsOptional()
  @IsString()
  reflexion?: string;
}

export class MigrateGuestProgressDto {
  @IsNumber()
  nivel: number;

  @IsNumber()
  subnivel: number;
}

export class MigrateGuestPetDto {
  @IsNumber()
  xp: number;

  @IsString()
  selected_form: string;

  @IsArray()
  unlocked_forms: string[];

  @IsOptional()
  last_actions?: Record<string, string>;
}

export class MigrateGuestDto {
  @IsString()
  guestId: string;

  @ValidateNested()
  @Type(() => MigrateGuestProfileDto)
  profile: MigrateGuestProfileDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MigrateGuestSobrietyDto)
  sobriety: MigrateGuestSobrietyDto | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MigrateGuestContactDto)
  contacts: MigrateGuestContactDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => MigrateGuestCheckinDto)
  checkins?: MigrateGuestCheckinDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => MigrateGuestProgressDto)
  progress?: MigrateGuestProgressDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MigrateGuestPetDto)
  pet?: MigrateGuestPetDto;
}