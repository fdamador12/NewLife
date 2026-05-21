import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { Challenge, ChallengeState } from '../../domain/entities/challenge.entity';
import { CHALLENGE_REPOSITORY } from '../../domain/ports/challenge.repository.port';
import type { IChallengeRepository } from '../../domain/ports/challenge.repository.port';

@Injectable()
export class PublishChallengeUseCase {
  constructor(@Inject(CHALLENGE_REPOSITORY) private readonly challengeRepo: IChallengeRepository) {}

  async execute(id: string): Promise<Challenge> {
    const existing = await this.challengeRepo.findByRetoId(id);
    if (!existing) throw new NotFoundException('Reto no encontrado');
    
    if (existing.estado === ChallengeState.PUBLISHED) {
      throw new ConflictException('El reto ya está publicado');
    }

    return this.challengeRepo.update(id, { estado: ChallengeState.PUBLISHED });
  }
}