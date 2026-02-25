import { Module } from '@nestjs/common';
import { AuthController } from './presentation/controllers/auth.controller';
import { AuthService } from './application/services/auth.service';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { RobleAuthAdapter } from './infrastructure/adapters/roble-auth.adapter';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LoginUseCase,
    RegisterUseCase,
    {
      provide: 'IAuthProviderPort',
      useClass: RobleAuthAdapter,
    },
  ],
})
export class AuthModule { }