import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { ChallengeState } from '../../domain/entities/challenge.entity';
import { CHALLENGE_REPOSITORY } from '../../domain/ports/challenge.repository.port';
import type { IChallengeRepository } from '../../domain/ports/challenge.repository.port';

@Injectable()
export class DeleteChallengeUseCase {
  constructor(@Inject(CHALLENGE_REPOSITORY) private readonly challengeRepo: IChallengeRepository) {}

  async execute(id: string): Promise<void> {
    const existing = await this.challengeRepo.findByRetoId(id);
    if (!existing) throw new NotFoundException('Reto no encontrado');
    
    await this.challengeRepo.deleteEnrollmentsByRetoId(id);

    await this.challengeRepo.delete(id);
  }
}