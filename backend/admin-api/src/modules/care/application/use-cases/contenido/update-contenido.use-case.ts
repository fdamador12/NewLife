import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CONTENIDO_REPOSITORY, UpdateContenidoInput } from '../../../domain/ports/contenido.repository.port';
import type { IContenidoRepository } from '../../../domain/ports/contenido.repository.port';

@Injectable()
export class UpdateContenidoUseCase {
  constructor(@Inject(CONTENIDO_REPOSITORY) private readonly repo: IContenidoRepository) {}

  async execute(id: string, input: UpdateContenidoInput) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Contenido no encontrado.');
    return this.repo.update(id, input);
  }
}