import { Injectable, Inject } from '@nestjs/common';
import { GRUPO_APOYO_REPOSITORY } from '../../../domain/ports/grupo-apoyo.repository.port';
import type { IGrupoApoyoRepository } from '../../../domain/ports/grupo-apoyo.repository.port';

@Injectable()
export class GetAllGruposUseCase {
  constructor(@Inject(GRUPO_APOYO_REPOSITORY) private readonly repo: IGrupoApoyoRepository) {}

  async execute() {
    return this.repo.findAll();
  }
}