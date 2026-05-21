import { Injectable } from '@nestjs/common';
import { GuidedMeditationRepository } from '../../infrastructure/services/guided-meditation.repository';
import { GuidedMeditationEntity } from '../../domain/entities/guided-meditation.entity';

@Injectable()
export class GetGuidedMeditationsUseCase {
  constructor(private repository: GuidedMeditationRepository) {}

  async execute(token: string): Promise<GuidedMeditationEntity[]> {
    return this.repository.getAll(token);
  }

  async executeByCategory(
    categoria: string,
    token: string,
  ): Promise<GuidedMeditationEntity[]> {
    return this.repository.getByCategory(categoria, token);
  }

  async executeById(id: string, token: string): Promise<GuidedMeditationEntity | null> {
    return this.repository.getById(id, token);
  }
}