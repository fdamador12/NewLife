import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsController } from './presentation/controllers/notifications.controller';
import { GetNotificationSettingsUseCase } from './application/use-cases/get-notification-settings.use-case';
import { UpdateNotificationSettingsUseCase } from './application/use-cases/update-notification-settings.use-case';
import { RobleNotificationSettingsAdapter } from './infrastructure/adapters/roble-notification-settings.adapter';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule, // expone DatabaseService
    AuthModule, // expone JwtAuthGuard + SystemAuthService
  ],
  controllers: [NotificationsController],
  providers: [
    GetNotificationSettingsUseCase,
    UpdateNotificationSettingsUseCase,
    {
      provide: 'INotificationSettingsRepository',
      useClass: RobleNotificationSettingsAdapter,
    },
  ],
  exports: [GetNotificationSettingsUseCase, UpdateNotificationSettingsUseCase],
})
export class NotificationsModule {}