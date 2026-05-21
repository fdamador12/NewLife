import { Injectable, Inject } from '@nestjs/common';
import { CATEGORIA_REPOSITORY } from '../../../domain/ports/categoria.repository.port';
import type { ICategoriaRepository } from '../../../domain/ports/categoria.repository.port';

@Injectable()
export class GetAllCategoriasUseCase {
  constructor(@Inject(CATEGORIA_REPOSITORY) private readonly repo: ICategoriaRepository) {}
  async execute() { return this.repo.findAll(); }
}