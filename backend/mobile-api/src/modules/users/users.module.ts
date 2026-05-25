import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller';
import { CompleteProfileUseCase } from './application/use-cases/complete-profile.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { DeleteAllDataUseCase } from './application/use-cases/delete-all-data.use-case';

@Module({
  imports: [
    DatabaseModule,
    // forwardRef necesario por circular dependency: AuthModule tambien
    // importa UsersModule (para usar DeleteAllDataUseCase desde el nuevo
    // endpoint publico de eliminacion de cuenta desde la landing).
    forwardRef(() => AuthModule),
  ],
  controllers: [UserController],
  providers: [
    CompleteProfileUseCase,
    GetProfileUseCase,
    UpdateProfileUseCase,
    DeleteAllDataUseCase,
  ],
  exports: [
    GetProfileUseCase,
    // DeleteAllDataUseCase tiene que ser exportado porque AuthModule
    // lo necesita para el RequestAccountDeletionUseCase (eliminacion
    // de cuenta desde la landing publica).
    DeleteAllDataUseCase,
  ],
})
export class UsersModule {}