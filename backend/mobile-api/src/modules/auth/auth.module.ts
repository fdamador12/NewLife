import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuthService } from './application/services/auth.service';
import { SystemAuthService } from './infrastructure/services/system-auth.service';
import { RobleAuthAdapter } from './infrastructure/adapters/roble-auth.adapter';
import { AuthController } from './presentation/controllers/auth.controller';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RegisterStaffUseCase } from './application/use-cases/register-staff.use-case';
import { RefreshTokenUseCase } from './application/use-cases/refresh-token.use-case';
import { MigrateGuestUseCase } from './application/use-cases/migrate-guest.use-case';
import { RequestAccountDeletionUseCase } from './application/use-cases/request-account-deletion.use-case';
import { DatabaseModule } from '../database/database.module';
import { UsersModule } from '../users/users.module';
import { VerifyEmailUseCase } from './application/use-cases/verify-email.use-case';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule,
    EventEmitterModule.forRoot(),
    // forwardRef por si UsersModule tambien importa AuthModule (evita ciclos).
    // Necesitamos DeleteAllDataUseCase de UsersModule para el flujo de
    // eliminacion publica desde landing.
    forwardRef(() => UsersModule),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    SystemAuthService,
    LoginUseCase,
    RegisterUseCase,
    RegisterStaffUseCase,
    RefreshTokenUseCase,
    MigrateGuestUseCase,
    VerifyEmailUseCase,
    RequestAccountDeletionUseCase,
    {
      provide: 'IAuthProviderPort',
      useClass: RobleAuthAdapter,
    },
  ],
  exports: [SystemAuthService, 'IAuthProviderPort', AuthService],
})
export class AuthModule {}