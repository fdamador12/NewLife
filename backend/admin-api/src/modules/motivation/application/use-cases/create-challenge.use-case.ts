import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { Challenge, ChallengeState } from '../../domain/entities/challenge.entity';
import { CHALLENGE_REPOSITORY } from '../../domain/ports/challenge.repository.port';
import type { IChallengeRepository, CreateChallengeInput } from '../../domain/ports/challenge.repository.port';

@Injectable()
export class CreateChallengeUseCase {
  constructor(@Inject(CHALLENGE_REPOSITORY) private readonly challengeRepo: IChallengeRepository) {}

  async execute(input: Omit<CreateChallengeInput, 'reto_id' | 'estado'>): Promise<Challenge> {
    return this.challengeRepo.create({
      ...input,
      reto_id: uuidv4(),
      estado: ChallengeState.DRAFT, 
    });
  }
}