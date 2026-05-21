import { Injectable } from '@nestjs/common';
import { IChallengeEvaluator } from './challenge-evaluator.interface';
import { DatabaseService } from '../../../database/infrastructure/database.service';

@Injectable()
export class CheckinTotalStrategy implements IChallengeEvaluator {
  constructor(private readonly db: DatabaseService) {}

  async evaluate(usuarioId: string, target: number, fechaInicio: string, userToken: string): Promise<number> {
    const result = await this.db.find('registro_diario', { usuario_id: usuarioId }, userToken);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);

    const fechaArranque = new Date(fechaInicio).getTime();

    // ✅ Filtrar registros desde fecha de inicio
    const validRows = rows.filter((r: any) => new Date(r.fecha).getTime() >= fechaArranque);

    // ✅ Agrupar por día único en UTC-5 — no contar múltiples registros del mismo día
    const diasUnicos = new Set<string>(
      validRows.map((r: any) => {
        const fecha = new Date(r.fecha);
        const fechaUTC5 = new Date(fecha.getTime() - (5 * 60 * 60 * 1000));
        return fechaUTC5.toISOString().split('T')[0];
      })
    );

    console.log(`[CheckinTotalStrategy] Días únicos desde ${fechaInicio}: ${diasUnicos.size}`);

    return Math.min(diasUnicos.size, target);
  }
}