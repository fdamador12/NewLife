import { Injectable, Logger } from '@nestjs/common';
import { IChallengeEvaluator } from './challenge-evaluator.interface';
import { DatabaseService } from '../../../database/infrastructure/database.service';

@Injectable()
export class SobrietyDaysStrategy implements IChallengeEvaluator {
  private logger = new Logger(SobrietyDaysStrategy.name);
  
  constructor(private readonly db: DatabaseService) {}

  async evaluate(
    usuarioId: string,
    target: number,
    userToken: string,
    masterToken: string,
  ): Promise<number> {
    this.logger.log(`[SobrietyDaysStrategy] Evaluando usuario: ${usuarioId}, target: ${target}`);

    // ✅ Obtener historial de sobriedad
    const result = await this.db.find('sobriedad', { usuario_id: usuarioId }, masterToken);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    
    if (!rows.length) {
      this.logger.warn(`[SobrietyDaysStrategy] Sin registro de sobriedad para ${usuarioId}`);
      return 0;
    }

    const sobrietyRecord = rows[0];
    const ultimoConsumo = new Date(sobrietyRecord.fecha_ultimo_consumo);
    
    this.logger.log(`[SobrietyDaysStrategy] Último consumo: ${ultimoConsumo.toISOString()}`);

    // ✅ Calcular días a las 00:00:00 para exactitud
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const lastConsumptionDate = new Date(ultimoConsumo);
    lastConsumptionDate.setHours(0, 0, 0, 0);

    const diffTime = today.getTime() - lastConsumptionDate.getTime();
    const daysSober = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    const resultado = Math.min(Math.max(daysSober, 0), target);

    this.logger.log(`[SobrietyDaysStrategy] Días sobrio calculados: ${daysSober} (capped a ${target})`);

    return resultado;
  }
}