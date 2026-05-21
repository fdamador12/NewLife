import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CATEGORIA_REPOSITORY, UpdateCategoriaInput } from '../../../domain/ports/categoria.repository.port';
import type { ICategoriaRepository } from '../../../domain/ports/categoria.repository.port';

@Injectable()
export class UpdateCategoriaUseCase {
  constructor(@Inject(CATEGORIA_REPOSITORY) private readonly repo: ICategoriaRepository) {}

  async execute(id: string, input: UpdateCategoriaInput) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Categoría no encontrada.');
    return this.repo.update(id, input);
  }
}