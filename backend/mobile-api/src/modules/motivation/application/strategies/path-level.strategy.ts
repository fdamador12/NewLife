import { Injectable } from '@nestjs/common';
import { IChallengeEvaluator } from './challenge-evaluator.interface';
import { DatabaseService } from '../../../database/infrastructure/database.service';

@Injectable()
export class PathLevelStrategy implements IChallengeEvaluator {
  constructor(private readonly db: DatabaseService) {}

  async evaluate(usuarioId: string, target: number, fechaInicio: string, userToken: string, masterToken: string): Promise<number> {
    const result = await this.db.find('camino', { usuario_id: usuarioId }, masterToken);
    const rows = Array.isArray(result) ? result : (result?.rows ?? []);
    if (!rows.length) return 0;

    const nivelActual = rows[0].nivel || 0;
    // IGNORAMOS la fechaInicio a propósito. El camino es vitalicio.
    return Math.min(nivelActual, target); 
  }
}