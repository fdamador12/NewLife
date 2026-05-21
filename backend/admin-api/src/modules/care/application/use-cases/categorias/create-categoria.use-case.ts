import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CATEGORIA_REPOSITORY, CreateCategoriaInput } from '../../../domain/ports/categoria.repository.port';
import type { ICategoriaRepository } from '../../../domain/ports/categoria.repository.port';

@Injectable()
export class CreateCategoriaUseCase {
  constructor(@Inject(CATEGORIA_REPOSITORY) private readonly repo: ICategoriaRepository) {}

  async execute(input: Omit<CreateCategoriaInput, 'categoria_id'>) {
    return this.repo.create({ ...input, categoria_id: uuidv4() });
  }
}