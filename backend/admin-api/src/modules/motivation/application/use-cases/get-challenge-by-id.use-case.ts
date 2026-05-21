import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { Challenge } from '../../domain/entities/challenge.entity';
import { CHALLENGE_REPOSITORY } from '../../domain/ports/challenge.repository.port';
import type { IChallengeRepository } from '../../domain/ports/challenge.repository.port';

@Injectable()
export class GetChallengeByIdUseCase {
  constructor(@Inject(CHALLENGE_REPOSITORY) private readonly challengeRepo: IChallengeRepository) {}

  async execute(id: string): Promise<Challenge> {
    const challenge = await this.challengeRepo.findByRetoId(id);
    if (!challenge) throw new NotFoundException(`Reto con UUID ${id} no encontrado`);
    return challenge;
  }
}