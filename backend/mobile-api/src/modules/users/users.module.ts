import { Module, forwardRef } from '@nestjs/common';
import { UserController } from './presentation/controllers/user.controller';
import { CompleteProfileUseCase } from './application/use-cases/complete-profile.use-case';
import { GetProfileUseCase } from './application/use-cases/get-profile.use-case';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { MediaModule } from '../media/media.module';
import { UpdateProfileUseCase } from './application/use-cases/update-profile.use-case';
import { UpdateAvatarUseCase } from './application/use-cases/update-avatar.use-case';
import { DeleteAllDataUseCase } from './application/use-cases/delete-all-data.use-case';

@Module({
  imports: [
    DatabaseModule,
    // forwardRef necesario por circular dependency:
    // UsersModule -> MediaModule -> AuthModule -> UsersModule
    // MediaModule expone MinioService que UpdateAvatarUseCase usa
    // para borrar avatares antiguos cuando el usuario cambia su foto.
    forwardRef(() => MediaModule),
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
    UpdateAvatarUseCase,
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