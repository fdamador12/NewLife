import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { FORO_DIA_REPOSITORY } from '../../domain/ports/foro-dia.repository.port';
import type { IForoDiaRepository, UpdateForoDiaInput } from '../../domain/ports/foro-dia.repository.port';

@Injectable()
export class UpdateForoDiaUseCase {
  constructor(@Inject(FORO_DIA_REPOSITORY) private readonly repo: IForoDiaRepository) {}

  async execute(id: string, input: UpdateForoDiaInput) {
    if (input.fecha) {
      const existing = await this.repo.findByDate(input.fecha);
      if (existing && existing._id !== id) {
        throw new ConflictException(`Ya existe un foro programado para la fecha ${input.fecha}`);
      }
    }
    return this.repo.update(id, input);
  }
}