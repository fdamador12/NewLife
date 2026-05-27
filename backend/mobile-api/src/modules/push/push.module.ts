import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { PushController } from './presentation/controllers/push.controller';
import { RegisterPushTokenUseCase } from './application/use-cases/register-push-token.use-case';
import { ExpoPushService } from './infrastructure/services/expo-push.service';
import { ResolveUserIdHelper } from '../communities/application/helpers/resolve-user-id.helper';

/**
 * PushModule — gestion de push notifications via Expo Push API.
 *
 * Exports:
 *  - ExpoPushService → inyectar en cualquier use-case que quiera enviar push
 *    (ej: ReplyDailyForumUseCase, CreateDailyForumUseCase, etc)
 */
@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PushController],
  providers: [
    RegisterPushTokenUseCase,
    ExpoPushService,
    // Proveemos ResolveUserIdHelper aqui mismo (esta declarado en communities
    // pero lo usamos directamente para no crear dependencia circular)
    ResolveUserIdHelper,
  ],
  exports: [ExpoPushService],
})
export class PushModule {}