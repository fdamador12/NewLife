import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GRUPO_APOYO_REPOSITORY, UpdateGrupoInput } from '../../../domain/ports/grupo-apoyo.repository.port';
import type { IGrupoApoyoRepository } from '../../../domain/ports/grupo-apoyo.repository.port';

@Injectable()
export class UpdateGrupoUseCase {
  constructor(@Inject(GRUPO_APOYO_REPOSITORY) private readonly repo: IGrupoApoyoRepository) {}

  async execute(id: string, input: UpdateGrupoInput) {
    const existing = await this.repo.findById(id);
    if (!existing) throw new NotFoundException(`Grupo de apoyo con ID ${id} no encontrado.`);
    
    return this.repo.update(id, input);
  }
}