import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { GRUPO_APOYO_REPOSITORY } from '../../../domain/ports/grupo-apoyo.repository.port';
import type { IGrupoApoyoRepository } from '../../../domain/ports/grupo-apoyo.repository.port';

@Injectable()
export class GetGrupoByIdUseCase {
  constructor(@Inject(GRUPO_APOYO_REPOSITORY) private readonly repo: IGrupoApoyoRepository) {}

  async execute(id: string) {
    const grupo = await this.repo.findById(id);
    if (!grupo) throw new NotFoundException(`Grupo de apoyo con ID ${id} no encontrado.`);
    return grupo;
  }
}