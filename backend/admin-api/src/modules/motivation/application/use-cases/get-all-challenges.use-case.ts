import { Injectable, Inject } from '@nestjs/common';
import { Challenge } from '../../domain/entities/challenge.entity';
import { CHALLENGE_REPOSITORY } from '../../domain/ports/challenge.repository.port';
import type { IChallengeRepository } from '../../domain/ports/challenge.repository.port';

@Injectable()
export class GetAllChallengesUseCase {
  constructor(
    @Inject(CHALLENGE_REPOSITORY)
    private readonly challengeRepo: IChallengeRepository,
  ) {}

  async execute(): Promise<Challenge[]> {
    return this.challengeRepo.findAll();
  }
}