import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RobleAuthAdapter } from './infrastructure/adapters/roble-auth.adapter';
import { SystemAuthService } from './infrastructure/services/system-auth.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginUseCase,
    RegisterUseCase,
    SystemAuthService,
    {
      provide: 'IAuthProviderPort',
      useClass: RobleAuthAdapter,
    },
  ],
})
export class AuthModule {}