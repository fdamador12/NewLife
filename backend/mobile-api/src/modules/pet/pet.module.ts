import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { RoblePetAdapter } from './infrastructure/adapters/roble-pet.adapter';
import { InitPetUseCase } from './application/use-cases/init-pet.use-case';
import { GetPetUseCase } from './application/use-cases/get-pet.use-case';
import { AddXpUseCase } from './application/use-cases/add-xp.use-case';
import { SelectFormUseCase } from './application/use-cases/select-form.use-case';
import { PetController } from './presentation/controllers/pet.controller';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [PetController],
  providers: [
    InitPetUseCase,
    GetPetUseCase,
    AddXpUseCase,
    SelectFormUseCase,
    {
      provide: 'IPetProviderPort',
      useClass: RoblePetAdapter,
    },
  ],
  exports: [AddXpUseCase, GetPetUseCase],
})
export class PetModule {}