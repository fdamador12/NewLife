import { Injectable } from '@nestjs/common';
import { IChallengeEvaluator } from './challenge-evaluator.interface';
import { DatabaseService } from '../../../database/infrastructure/database.service';

@Injectable()
export class CheckinStreakStrategy implements IChallengeEvaluator {
  constructor(private readonly db: DatabaseService) {}

  async evaluate(usuarioId: string, target: number, fechaInicio: string, userToken: string): Promise<number> {
    const result = await this.db.find('registro_diario', { usuario_id: usuarioId }, userToken);
    let rows = Array.isArray(result) ? result : (result?.rows ?? []);

    if (!rows.length) {
      console.log(`[CheckinStreakStrategy] Sin registros para usuario ${usuarioId}`);
      return 0;
    }

    // ✅ Agrupar por día en UTC-5
    const diasUnicos = [...new Set<string>(
      rows.map((r: any) => {
        const fecha = new Date(r.fecha);
        const fechaUTC5 = new Date(fecha.getTime() - (5 * 60 * 60 * 1000));
        return fechaUTC5.toISOString().split('T')[0];
      })
    )].sort((a, b) => b.localeCompare(a));

    console.log(`[CheckinStreakStrategy] Días únicos encontrados: ${diasUnicos.length}`);
    console.log(`[CheckinStreakStrategy] Últimos 5 días: ${diasUnicos.slice(0, 5).join(', ')}`);

    if (!diasUnicos.length) return 0;

    // ✅ Calcular hoy y ayer en UTC-5
    const ahora = new Date();
    const ahoraUTC5 = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    const todayStr = ahoraUTC5.toISOString().split('T')[0];

    const ayerUTC5 = new Date(ahoraUTC5);
    ayerUTC5.setDate(ayerUTC5.getDate() - 1);
    const yesterdayStr = ayerUTC5.toISOString().split('T')[0];

    if (diasUnicos[0] !== todayStr && diasUnicos[0] !== yesterdayStr) {
      console.log(`[CheckinStreakStrategy] Racha rota. Último registro: ${diasUnicos[0]}, Hoy: ${todayStr}`);
      return 0;
    }

    let streak = 0;
    let currentDate = new Date(diasUnicos[0] + 'T00:00:00');

    for (const d of diasUnicos) {
      const currentDateStr = currentDate.toISOString().split('T')[0];
      if (d === currentDateStr) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    const resultado = Math.min(streak, target);
    console.log(`[CheckinStreakStrategy] Racha calculada: ${streak} días (capped a ${target})`);
    return resultado;
  }
}