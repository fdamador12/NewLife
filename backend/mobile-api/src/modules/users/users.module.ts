import { Module } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller';
import { CompleteProfileUseCase } from './application/use-cases/complete-profile.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { DeleteAccountUseCase } from './application/use-cases/delete-account.use-case';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { DeleteAllDataUseCase } from './application/use-cases/delete-all-data.use-case';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [UserController],
  providers: [CompleteProfileUseCase, GetProfileUseCase, UpdateProfileUseCase, DeleteAccountUseCase, DeleteAllDataUseCase],
  exports: [GetProfileUseCase], 
})
export class UsersModule { }