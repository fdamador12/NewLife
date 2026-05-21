import { Module, forwardRef } from '@nestjs/common';
import { AdminModule } from '../admin/admin.module';

import { FraseDiaController } from './presentation/controllers/frase-dia.controller';
import { FRASE_DIA_REPOSITORY } from './domain/ports/frase-dia.repository.port';
import { RobleFraseDiaRepository } from './infrastructure/adapters/roble-frase-dia.repository';
import { CreateFraseDiaUseCase } from './application/use-cases/create-frase-dia.use-case';
import { UpdateFraseDiaUseCase } from './application/use-cases/update-frase-dia.use-case';
import { GetFraseDiaByDateUseCase } from './application/use-cases/get-frase-dia-by-date.use-case';
import { GetAllFrasesUseCase } from './application/use-cases/get-all-frases.use-case';

import { ChallengeController } from './presentation/controllers/challenge.controller';
import { CHALLENGE_REPOSITORY } from './domain/ports/challenge.repository.port';
import { RobleChallengeRepository } from './infrastructure/adapters/roble-challenge.repository';
import { CreateChallengeUseCase } from './application/use-cases/create-challenge.use-case';
import { UpdateChallengeUseCase } from './application/use-cases/update-challenge.use-case';
import { DeleteChallengeUseCase } from './application/use-cases/delete-challenge.use-case';
import { PublishChallengeUseCase } from './application/use-cases/publish-challenge.use-case';
import { GetAllChallengesUseCase } from './application/use-cases/get-all-challenges.use-case';
import { GetChallengeByIdUseCase } from './application/use-cases/get-challenge-by-id.use-case';

@Module({
  imports: [
    forwardRef(() => AdminModule),
  ],
  controllers: [
    FraseDiaController, 
    ChallengeController
  ],
  providers: [
    {
      provide: FRASE_DIA_REPOSITORY,
      useClass: RobleFraseDiaRepository,
    },
    CreateFraseDiaUseCase,
    UpdateFraseDiaUseCase,
    GetFraseDiaByDateUseCase,
    GetAllFrasesUseCase,

    {
      provide: CHALLENGE_REPOSITORY,
      useClass: RobleChallengeRepository,
    },
    CreateChallengeUseCase,
    UpdateChallengeUseCase,
    DeleteChallengeUseCase,
    PublishChallengeUseCase,
    GetAllChallengesUseCase,
    GetChallengeByIdUseCase,
  ],
  exports: [FRASE_DIA_REPOSITORY, CHALLENGE_REPOSITORY],
})
export class MotivationModule {}