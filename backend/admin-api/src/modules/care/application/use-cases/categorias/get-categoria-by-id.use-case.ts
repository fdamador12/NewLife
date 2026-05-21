import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CATEGORIA_REPOSITORY } from '../../../domain/ports/categoria.repository.port';
import type { ICategoriaRepository } from '../../../domain/ports/categoria.repository.port';

@Injectable()
export class GetCategoriaByIdUseCase {
  constructor(@Inject(CATEGORIA_REPOSITORY) private readonly repo: ICategoriaRepository) {}

  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Categoría no encontrada.');
    return item;
  }
}