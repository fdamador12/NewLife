import { Injectable } from '@nestjs/common';
import { IChallengeEvaluator } from './challenge-evaluator.interface';
import { SobrietyDaysStrategy } from './sobriety-days.strategy';
import { CheckinStreakStrategy } from './checkin-streak.strategy';
import { CheckinTotalStrategy } from './checkin-total.strategy';
import { PathLevelStrategy } from './path-level.strategy';

@Injectable()
export class ChallengeEvaluatorFactory {
  constructor(
    private readonly sobrietyDays: SobrietyDaysStrategy,
    private readonly checkinStreak: CheckinStreakStrategy,
    private readonly checkinTotal: CheckinTotalStrategy,
    private readonly pathLevel: PathLevelStrategy,
  ) {}

  getEvaluator(tipo: string): IChallengeEvaluator {
    switch (tipo) {
      case 'SOBRIETY_DAYS': return this.sobrietyDays;
      case 'CHECKIN_STREAK': return this.checkinStreak;
      case 'CHECKIN_TOTAL': return this.checkinTotal;
      case 'PATH_LEVEL': return this.pathLevel;
      default: throw new Error(`Estrategia no implementada para: ${tipo}`);
    }
  }
}