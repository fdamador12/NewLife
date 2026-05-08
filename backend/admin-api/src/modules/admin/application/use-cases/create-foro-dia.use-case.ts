import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { FORO_DIA_REPOSITORY } from '../../domain/ports/foro-dia.repository.port';
import type { IForoDiaRepository, CreateForoDiaInput } from '../../domain/ports/foro-dia.repository.port';

@Injectable()
export class CreateForoDiaUseCase {
  constructor(@Inject(FORO_DIA_REPOSITORY) private readonly repo: IForoDiaRepository) {}

  async execute(input: CreateForoDiaInput) {
    const existing = await this.repo.findByDate(input.fecha);
    if (existing) {
      throw new ConflictException(`Ya existe un foro programado para la fecha ${input.fecha}`);
    }
    return this.repo.create(input);
  }
}