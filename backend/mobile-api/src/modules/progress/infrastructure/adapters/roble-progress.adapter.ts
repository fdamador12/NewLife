import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { IProgressProviderPort, GratitudeEntryResult, SobrietyRecord, AhorroRecord } from '../../domain/ports/progress-provider.port';
import { DailyCheckinEntity } from '../../domain/entities/daily-checkin.entity';
import { CaminoEntity } from '../../domain/entities/camino.entity';

@Injectable()
export class RobleProgressAdapter implements IProgressProviderPort {
  private logger = new Logger(RobleProgressAdapter.name);

  constructor(private readonly dbService: DatabaseService) {}

  async createDailyCheckin(data: Partial<DailyCheckinEntity>, token: string): Promise<any> {
    let fecha: string;
    if (data.fecha) {
      fecha = data.fecha;
    } else {
      const ahora = new Date();
      const fechaUTC5 = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
      fecha = fechaUTC5.toISOString().slice(0, 19) + '-05:00';
    }

    const record = {
      usuario_id: data.usuario_id,
      fecha: fecha,
      emocion: data.emocion,
      consumo: data.consumo,
      gratitud: data.gratitud,
      ubicacion: data.ubicacion ?? null,
      social: data.social ?? null,
      reflexion: data.reflexion ?? null,
    };

    console.log('📤 Guardando registro con fecha:', fecha);
    return await this.dbService.insert('registro_diario', [record], token);
  }

  async updateSobrietyDate(usuarioId: string, fechaUTC: string, masterToken: string): Promise<void> {
    this.logger.log(`🔄 Actualizando sobriedad a: ${fechaUTC}`);
    try {
      const existing = await this.dbService.find('sobriedad', { usuario_id: usuarioId }, masterToken);
      const rows = Array.isArray(existing) ? existing : (existing?.rows ?? []);

      if (rows.length > 0) {
        await this.dbService.update(
          'sobriedad', 'usuario_id', usuarioId,
          { fecha_ultimo_consumo: fechaUTC, updated_at: new Date().toISOString() },
          masterToken,
        );
        this.logger.log(`✅ Sobriedad actualizada (UPDATE)`);
      } else {
        await this.dbService.insert('sobriedad', [{
          usuario_id: usuarioId,
          fecha_ultimo_consumo: fechaUTC,
          updated_at: new Date().toISOString(),
        }], masterToken);
        this.logger.log(`✅ Sobriedad creada (INSERT)`);
      }
    } catch (error) {
      this.logger.error('❌ Error en updateSobrietyDate:', error);
      throw error;
    }
  }

  async getGratitudeHistory(usuarioId: string, token: string): Promise<GratitudeEntryResult[]> {
    const result = await this.dbService.find('registro_diario', { usuario_id: usuarioId }, token);
    const rows = Array.isArray(result) ? result : (result.rows ?? []);

    return rows.map((row: any) => {
      const fecha = new Date(row.fecha);
      return {
        dia: fecha.toISOString().split('T')[0],
        hora: fecha.toTimeString().split(' ')[0].slice(0, 5),
        gratitud: row.gratitud,
      };
    });
  }

  async getCamino(usuarioId: string, masterToken: string): Promise<CaminoEntity | null> {
    const result = await this.dbService.find('camino', { usuario_id: usuarioId }, masterToken);
    const rows = Array.isArray(result) ? result : (result.rows ?? []);
    return rows[0] ?? null;
  }

  async upsertCamino(data: Partial<CaminoEntity>, masterToken: string): Promise<void> {
    const now = new Date().toISOString();
    try {
      const existing = await this.dbService.find('camino', { usuario_id: data.usuario_id }, masterToken);
      const rows = Array.isArray(existing) ? existing : (existing?.rows ?? []);

      if (rows.length > 0) {
        await this.dbService.update(
          'camino', 'usuario_id', data.usuario_id,
          { nivel: data.nivel, subnivel: data.subnivel, updated_at: now },
          masterToken,
        );
      } else {
        await this.dbService.insert('camino', [{
          usuario_id: data.usuario_id,
          nivel: data.nivel,
          subnivel: data.subnivel,
          updated_at: now,
        }], masterToken);
      }
    } catch (error) {
      this.logger.error('Error en upsertCamino:', error);
      throw error;
    }
  }

  async getAllCheckins(usuarioId: string, token: string): Promise<any[]> {
    const result = await this.dbService.find('registro_diario', { usuario_id: usuarioId }, token);
    return Array.isArray(result) ? result : ((result as any)?.rows ?? []);
  }

  async getTodayCheckin(usuarioId: string, token: string): Promise<any | null> {
    const result = await this.dbService.find('registro_diario', { usuario_id: usuarioId }, token);
    const rows: any[] = Array.isArray(result) ? result : ((result as any)?.rows ?? []);
    const today = new Date().toISOString().split('T')[0];
    return rows.find((r: any) => r.fecha?.toString().startsWith(today)) ?? null;
  }

  async getTodayCheckins(usuarioId: string, token: string): Promise<any[]> {
    const result = await this.dbService.find('registro_diario', { usuario_id: usuarioId }, token);
    const rows: any[] = Array.isArray(result) ? result : ((result as any)?.rows ?? []);
    const todayUTC5 = this.getTodayUTC5();
    return rows.filter((r: any) => {
      const fecha = new Date(r.fecha);
      const fechaUTC5 = new Date(fecha.getTime() - (5 * 60 * 60 * 1000));
      return fechaUTC5.toISOString().split('T')[0] === todayUTC5;
    });
  }

  async updateTodayCheckin(id: string, data: Partial<DailyCheckinEntity>, token: string): Promise<any> {
    return await this.dbService.update(
      'registro_diario', '_id', id,
      {
        emocion: data.emocion,
        consumo: data.consumo,
        gratitud: data.gratitud,
        ubicacion: data.ubicacion ?? null,
        social: data.social ?? null,
        reflexion: data.reflexion ?? null,
      },
      token,
    );
  }

  async getMonthCheckins(usuarioId: string, month: number, year: number, token: string): Promise<any[]> {
    const result = await this.dbService.find('registro_diario', { usuario_id: usuarioId }, token);
    const rows: any[] = Array.isArray(result) ? result : ((result as any)?.rows ?? []);

    return rows.filter((r: any) => {
      const fecha = new Date(r.fecha);
      return fecha.getMonth() + 1 === month && fecha.getFullYear() === year;
    });
  }

  async getSobrietyRecord(usuarioId: string, masterToken: string): Promise<SobrietyRecord | null> {
    try {
      const result = await this.dbService.find('sobriedad', { usuario_id: usuarioId }, masterToken);
      const rows = Array.isArray(result) ? result : (result?.rows ?? []);
      return rows[0] ?? null;
    } catch (error) {
      this.logger.error('Error en getSobrietyRecord:', error);
      return null;
    }
  }

  async getAllRegistrosDiario(
    usuarioId: string,
    token: string,
  ): Promise<Array<{ fecha: string; emocion: string }>> {
    try {
      const registros = await this.getAllCheckins(usuarioId, token);
      return registros.map((r: any) => ({
        fecha: r.fecha,
        emocion: r.emocion,
      }));
    } catch (error) {
      this.logger.error('Error obteniendo registros diarios:', error);
      throw new Error('No se pudieron obtener los registros');
    }
  }

  async getConsumptionDates(
    usuarioId: string,
    token: string,
  ): Promise<Array<{ fecha: string; consumo: boolean }>> {
    try {
      const registros = await this.getAllCheckins(usuarioId, token);
      const dayMap = new Map<string, boolean>();

      registros.forEach((r: any) => {
        const fecha = new Date(r.fecha);
        const dia = fecha.toISOString().split('T')[0];
        const consumo = r.consumo === true || r.consumo === 'true';

        if (dayMap.has(dia)) {
          if (consumo) dayMap.set(dia, true);
        } else {
          dayMap.set(dia, consumo);
        }
      });

      return Array.from(dayMap.entries()).map(([fecha, consumo]) => ({
        fecha,
        consumo,
      }));
    } catch (error) {
      this.logger.error('Error en getConsumptionDates:', error);
      throw new Error('No se pudieron obtener las fechas de consumo');
    }
  }

  async getGastoSemanal(usuarioId: string, masterToken: string): Promise<number> {
    try {
      const result = await this.dbService.find(
        'informacion_personal',
        { usuario_id: usuarioId },
        masterToken,
      );
      const rows = Array.isArray(result) ? result : (result?.rows ?? []);
      return rows[0]?.gasto_semanal ?? 0;
    } catch (error) {
      this.logger.error('Error en getGastoSemanal:', error);
      return 0;
    }
  }

  async getAhorro(usuarioId: string, masterToken: string): Promise<AhorroRecord | null> {
    try {
      const result = await this.dbService.find(
        'ahorro_usuario',
        { usuario_id: usuarioId },
        masterToken,
      );
      const rows = Array.isArray(result) ? result : (result?.rows ?? []);
      return rows[0] ?? null;
    } catch (error) {
      this.logger.error('Error en getAhorro:', error);
      return null;
    }
  }

async upsertAhorro(usuarioId: string, nuevoTotal: number, masterToken: string): Promise<void> {
  try {
    const existing = await this.dbService.find(
      'ahorro_usuario',
      { usuario_id: usuarioId },
      masterToken,
    );
    const rows = Array.isArray(existing) ? existing : (existing?.rows ?? []);
    const now = new Date().toISOString();

    if (rows.length > 0) {
      await this.dbService.update(
        'ahorro_usuario',
        'usuario_id',
        usuarioId,
        { ahorro_total: nuevoTotal, updated_at: now },
        masterToken,
      );
    } else {
      await this.dbService.insert('ahorro_usuario', [{
        usuario_id: usuarioId,
        ahorro_total: nuevoTotal,
        updated_at: now,
      }], masterToken);
    }
  } catch (error: any) {
    console.log('🔍 ERROR upsertAhorro:', JSON.stringify(error?.response?.data ?? error?.message));
    this.logger.error('Error en upsertAhorro:', error);
    throw error;
  }
}

  private getTodayUTC5(): string {
    const ahora = new Date();
    const fechaUTC5 = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    return fechaUTC5.toISOString().split('T')[0];
  }
}