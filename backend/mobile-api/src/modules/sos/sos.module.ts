import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { SystemAuthService } from '../auth/infrastructure/services/system-auth.service';

import { BreathingSoundsController } from './infrastructure/controllers/breathing-sounds.controller';
import { BreathingSoundsRepository } from './infrastructure/services/breathing-sounds.repository';
import { GetBreathingSoundsUseCase } from './application/use-cases/get-breathing-sounds.use-case';
import { SyncFreesoundSoundsUseCase } from './application/use-cases/sync-freesound-sounds.use-case';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [BreathingSoundsController],
  providers: [
    BreathingSoundsRepository,
    GetBreathingSoundsUseCase,
    SyncFreesoundSoundsUseCase,
    SystemAuthService,
  ],
  exports: [
    BreathingSoundsRepository,
    GetBreathingSoundsUseCase,
    SyncFreesoundSoundsUseCase,
  ],
})
export class SosModule {}