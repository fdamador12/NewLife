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
}