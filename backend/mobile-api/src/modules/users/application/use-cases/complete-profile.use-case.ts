import { Injectable, ConflictException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { InitialRegisterDto } from '../../presentation/dtos/initial-register.dto';

@Injectable()
export class CompleteProfileUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) { }

  async execute(userId: string, dto: InitialRegisterDto) {
    const masterToken = await this.systemAuth.getMasterToken();

    const existing = await this.dbService.find('informacion_personal', { usuario_id: userId }, masterToken);
    const rows = Array.isArray(existing) ? existing : (existing.rows || []);

    const generateId = () => Math.random().toString(36).substring(2, 14).padEnd(12, '0');
    const now = new Date().toISOString();

    const infoPersonalRecord = {
      usuario_id: userId,
      apodo: dto.apodo,
      pronombre: dto.pronombre,
      motivo_sobrio: dto.motivo_sobrio,
      gasto_semanal: Number(dto.gasto_semana),
      created_at: now,
    };

    const configRecord = {
      _id: generateId(),
      usuario_id: userId,
      reg_lugar_riesgo: Boolean(dto.reg_lugar_riesgo),
      comp_logros_comunid: Boolean(dto.comp_logros_comunid),
      moment_motiv: dto.moment_motiv,
    };

    const sobriedadRecord = {
      usuario_id: userId,
      fecha_ultimo_consumo: dto.ult_fecha_consumo,
      updated_at: now,
    };

    let resInfo: any;
    if (rows.length > 0) {
      // Ya existe por migración de invitado — actualizar en vez de insertar
      resInfo = await this.dbService.update(
        'informacion_personal',
        'usuario_id',
        userId,
        infoPersonalRecord,
        masterToken,
      );
    } else {
      resInfo = await this.dbService.insert(
        'informacion_personal',
        [{ _id: generateId(), ...infoPersonalRecord }],
        masterToken,
      );
    }

    // sobriedad igual — puede ya existir por migración
    const existingSobr = await this.dbService.find('sobriedad', { usuario_id: userId }, masterToken);
    const sobrRows = Array.isArray(existingSobr) ? existingSobr : (existingSobr.rows || []);

    let resSobr: any;
    if (sobrRows.length > 0) {
      resSobr = await this.dbService.update(
        'sobriedad',
        'usuario_id',
        userId,
        sobriedadRecord,
        masterToken,
      );
    } else {
      resSobr = await this.dbService.insert(
        'sobriedad',
        [{ _id: generateId(), ...sobriedadRecord }],
        masterToken,
      );
    }

    const resConf = await this.dbService.insert(
      'config_usuarios',
      [configRecord],
      masterToken,
    );

    return {
      message: 'Onboarding realizado con éxito',
      results: {
        informacion_personal: resInfo,
        configuracion: resConf,
        sobriedad: resSobr,
      },
    };
  }

  async checkStatus(userId: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const res = await this.dbService.find('informacion_personal', { usuario_id: userId }, masterToken);
    const rows = Array.isArray(res) ? res : (res.rows || []);
    return { completed: rows.length > 0 };
  }
}