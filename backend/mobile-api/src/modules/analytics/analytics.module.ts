import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

import { EventsController } from './presentation/controllers/events.controller';
import { TrackEventUseCase } from './application/use-cases/track-event.use-case';
import { UserHashService } from './infrastructure/services/user-hash.service';
import { RobleAnalyticsAdapter } from './infrastructure/adapters/roble-analytics.adapter';
import { ANALYTICS_STORAGE_PORT } from './domain/ports/analytics-storage.port';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule, // expone DatabaseService
    AuthModule, // expone JwtAuthGuard, SystemAuthService, IAuthProviderPort
  ],
  controllers: [EventsController],
  providers: [
    TrackEventUseCase,
    UserHashService,
    {
      provide: ANALYTICS_STORAGE_PORT,
      useClass: RobleAnalyticsAdapter,
    },
  ],
})
export class AnalyticsModule {}