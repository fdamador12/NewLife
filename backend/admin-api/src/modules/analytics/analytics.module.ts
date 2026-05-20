import { Module, forwardRef } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';

// --- Controllers ---
import { AnalyticsController } from './presentation/controllers/analytics.controller';

// --- Ports & Adapters ---
import { ANALYTICS_STORAGE_PORT } from './domain/ports/analytics-storage.port';
import { RobleAnalyticsAdapter } from './infrastructure/adapters/roble-analytics.adapter';

// --- Use Cases ---
import { GetOverviewMetricsUseCase } from './application/use-cases/get-overview-metrics.use-case';
import { GetDailyEventsUseCase } from './application/use-cases/get-daily-events.use-case';
import { GetCheckinFunnelUseCase } from './application/use-cases/get-checkin-funnel.use-case';
import { GetSosStatsUseCase } from './application/use-cases/get-sos-stats.use-case';
import { GetTopContentUseCase } from './application/use-cases/get-top-content.use-case';
import { GetTopPhrasesUseCase } from './application/use-cases/get-top-phrases.use-case';
import { GetLevelDistributionUseCase } from './application/use-cases/get-level-distribution.use-case';
import { GetActivityByHourUseCase } from './application/use-cases/get-activity-by-hour.use-case';
import { GetEventsListUseCase } from './application/use-cases/get-events-list.use-case';

/**
 * Modulo de analiticas del admin-api.
 *
 * Solo LECTURA: este modulo lee de la tabla `analytics_events` que el
 * mobile-api escribe. Nunca inserta ni modifica eventos.
 *
 * Para autenticacion usa el AdminJwtGuard del AdminModule.
 *
 * top-content y top-phrases hacen lookups a otras tablas
 * (contenido_educativo, frases_dia) usando el RobleHttpService que
 * importamos del AdminModule.
 */
@Module({
  imports: [forwardRef(() => AdminModule)],
  controllers: [AnalyticsController],
  providers: [
    { provide: ANALYTICS_STORAGE_PORT, useClass: RobleAnalyticsAdapter },
    GetOverviewMetricsUseCase,
    GetDailyEventsUseCase,
    GetCheckinFunnelUseCase,
    GetSosStatsUseCase,
    GetTopContentUseCase,
    GetTopPhrasesUseCase,
    GetLevelDistributionUseCase,
    GetActivityByHourUseCase,
    GetEventsListUseCase,
  ],
  exports: [ANALYTICS_STORAGE_PORT],
})
export class AnalyticsModule {}