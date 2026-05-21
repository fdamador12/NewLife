import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { ProgressModule } from '../progress/progress.module';
import { RobleMotivationAdapter } from './infrastructure/adapters/roble-motivation.adapter';
import { GetFraseDelDiaUseCase } from './application/use-cases/get-frase-del-dia.use-case';
import { GetFrasesGuardadasUseCase } from './application/use-cases/get-frases-guardadas.use-case';
import { GuardarFraseUseCase } from './application/use-cases/guardar-frase.use-case';
import { DesguardarFraseUseCase } from './application/use-cases/desguardar-frase.use-case';
import { GetFrasesPorFechaUseCase } from './application/use-cases/get-frases-por-fecha.use-case';
import { EvaluateChallengesUseCase } from './application/use-cases/evaluate-challenges.use-case';
import { JoinChallengeUseCase } from './application/use-cases/join-challenge.use-case';
import { GetMyChallengesUseCase } from './application/use-cases/get-my-challenges.use-case';
import { ChallengeEvaluatorFactory } from './application/strategies/challenge-evaluator.factory';
import { SobrietyDaysStrategy } from './application/strategies/sobriety-days.strategy';
import { CheckinStreakStrategy } from './application/strategies/checkin-streak.strategy';
import { CheckinTotalStrategy } from './application/strategies/checkin-total.strategy';
import { PathLevelStrategy } from './application/strategies/path-level.strategy';
import { ProgressEventsListener } from './application/listeners/progress-events.listener';
import { GetMisMedallasUseCase } from './application/use-cases/get-mis-medallas.use-case';
import { ReclamarXpUseCase } from './application/use-cases/reclamar-xp.use-case';
import { MotivationController } from './presentation/controllers/motivation.controller';
import { PetModule } from '../pet/pet.module';

@Module({
  imports: [DatabaseModule, AuthModule, EventEmitterModule, ProgressModule, PetModule],
  controllers: [
    MotivationController,
  ],
  providers: [
    {
      provide: 'IMotivationProviderPort',
      useClass: RobleMotivationAdapter,
    },
    GetFraseDelDiaUseCase,
    GetFrasesGuardadasUseCase,
    GuardarFraseUseCase,
    DesguardarFraseUseCase,
    GetFrasesPorFechaUseCase,
    EvaluateChallengesUseCase,
    JoinChallengeUseCase,
    GetMyChallengesUseCase,
    ChallengeEvaluatorFactory,
    SobrietyDaysStrategy,
    CheckinStreakStrategy,
    CheckinTotalStrategy,
    PathLevelStrategy,
    ProgressEventsListener,
    GetMisMedallasUseCase,
    ReclamarXpUseCase,
  ],
  exports: ['IMotivationProviderPort', GetFrasesPorFechaUseCase],
})
export class MotivationModule {}