import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CONTENIDO_REPOSITORY } from '../../../domain/ports/contenido.repository.port';
import type { IContenidoRepository } from '../../../domain/ports/contenido.repository.port';

@Injectable()
export class GetContenidoByIdUseCase {
  constructor(@Inject(CONTENIDO_REPOSITORY) private readonly repo: IContenidoRepository) {}

  async execute(id: string) {
    const item = await this.repo.findById(id);
    if (!item) throw new NotFoundException('Contenido no encontrado.');
    return item;
  }
}