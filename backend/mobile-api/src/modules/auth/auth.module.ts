import { Module } from '@nestjs/common';
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
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [
    DatabaseModule, 
    ConfigModule, 
    EventEmitterModule.forRoot() // Se recomienda .forRoot() si es la configuración global
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
    {
      provide: 'IAuthProviderPort',
      useClass: RobleAuthAdapter,
    },
  ],
  exports: [SystemAuthService, 'IAuthProviderPort', AuthService],
})
export class AuthModule {}