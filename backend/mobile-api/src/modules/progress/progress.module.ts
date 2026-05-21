import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { DatabaseModule } from '../database/database.module';
import { RobleProgressAdapter } from './infrastructure/adapters/roble-progress.adapter';
import { DailyCheckinUseCase } from './application/use-cases/daily-checkin.use-case';
import { GratitudeHistoryUseCase } from './application/use-cases/gratitude-history.use-case';
import { ProgressController } from './presentation/controllers/progress.controller';
import { AdvanceCaminoUseCase } from './application/use-cases/advance-camino.use-case';
import { GetCaminoUseCase } from './application/use-cases/get-camino.use-case';
import { ProgressSummaryUseCase } from './application/use-cases/progress-summary.use-case';
import { GetTodayCheckinUseCase } from './application/use-cases/get-today-checkin.use-case';
import { GetCalendarUseCase } from './application/use-cases/get-calendar.use-case';
import { GetRiskChartsUseCase } from './application/use-cases/get-risk-charts.use-case';
import { GetSobrietyTimeUseCase } from './application/use-cases/get-sobriety-time.use-case';
import { InitCaminoUseCase } from './application/use-cases/init-camino.use-case';
import { InitSobrietyUseCase } from './application/use-cases/init-sobriety.use-case';
import { GetAllRegistrosDiarioUseCase } from './application/use-cases/get-all-registros-diario.use-case';
import { AuthModule } from '../auth/auth.module';
import { GetConsumptionDatesUseCase } from './application/use-cases/get-consumption-dates.use-case';
import { GetAhorroUseCase } from './application/use-cases/get-ahorro.use-case';

@Module({
  imports: [DatabaseModule, AuthModule, EventEmitterModule],
  controllers: [ProgressController],
  providers: [
    DailyCheckinUseCase,
    GratitudeHistoryUseCase,
    AdvanceCaminoUseCase,
    GetCaminoUseCase,
    ProgressSummaryUseCase,
    GetTodayCheckinUseCase,
    GetCalendarUseCase,
    GetRiskChartsUseCase,
    GetSobrietyTimeUseCase,
    InitCaminoUseCase,
    InitSobrietyUseCase,
    GetAllRegistrosDiarioUseCase,
    GetConsumptionDatesUseCase,
    GetAhorroUseCase,
    {
      provide: 'IProgressProviderPort',
      useClass: RobleProgressAdapter,
    },
  ],
  exports: ['IProgressProviderPort', EventEmitterModule],
})
export class ProgressModule {}