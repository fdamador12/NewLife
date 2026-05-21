import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { CATEGORIA_REPOSITORY } from '../../../domain/ports/categoria.repository.port';
import type { ICategoriaRepository } from '../../../domain/ports/categoria.repository.port';
import { CONTENIDO_REPOSITORY } from '../../../domain/ports/contenido.repository.port';
import type { IContenidoRepository } from '../../../domain/ports/contenido.repository.port';

@Injectable()
export class DeleteCategoriaUseCase {
  constructor(
    @Inject(CATEGORIA_REPOSITORY) private readonly categoriaRepo: ICategoriaRepository,
    @Inject(CONTENIDO_REPOSITORY) private readonly contenidoRepo: IContenidoRepository,
  ) {}

  async execute(id: string) {
    const existing = await this.categoriaRepo.findById(id);
    if (!existing) throw new NotFoundException('Categoría no encontrada.');
    
    // 1. Quitamos la categoría a los contenidos que la tengan
    await this.contenidoRepo.nullifyCategoria(id);

    // 2. Borramos la categoría
    await this.categoriaRepo.delete(id);
  }
}