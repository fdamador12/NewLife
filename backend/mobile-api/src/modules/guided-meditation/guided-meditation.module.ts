import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthModule } from '../auth/auth.module';
import { GuidedMeditationController } from './infrastructure/controllers/guided-meditation.controller';
import { GuidedMeditationRepository } from './infrastructure/services/guided-meditation.repository';
import { GetGuidedMeditationsUseCase } from './application/use-cases/get-guided-meditations.use-case';
import { SystemAuthService } from '../auth/infrastructure/services/system-auth.service';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [GuidedMeditationController],
  providers: [GuidedMeditationRepository, GetGuidedMeditationsUseCase, SystemAuthService],
  exports: [GetGuidedMeditationsUseCase],
})
export class GuidedMeditationModule {}