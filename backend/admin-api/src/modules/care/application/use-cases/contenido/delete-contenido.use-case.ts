import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CONTENIDO_REPOSITORY } from '../../../domain/ports/contenido.repository.port';
import type { IContenidoRepository } from '../../../domain/ports/contenido.repository.port';

@Injectable()
export class DeleteContenidoUseCase {
  constructor(@Inject(CONTENIDO_REPOSITORY) private readonly repo: IContenidoRepository) {}

  async execute(id: string) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException('Contenido no encontrado.');
    await this.repo.delete(id);
  }
}