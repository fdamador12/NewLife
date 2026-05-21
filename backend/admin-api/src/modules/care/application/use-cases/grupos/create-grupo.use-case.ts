import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { GRUPO_APOYO_REPOSITORY, CreateGrupoInput } from '../../../domain/ports/grupo-apoyo.repository.port';
import type { IGrupoApoyoRepository } from '../../../domain/ports/grupo-apoyo.repository.port';
@Injectable()
export class CreateGrupoUseCase {
  constructor(@Inject(GRUPO_APOYO_REPOSITORY) private readonly repo: IGrupoApoyoRepository) {}

  async execute(input: Omit<CreateGrupoInput, 'grupo_id'>) {
    return this.repo.create({
      ...input,
      grupo_id: uuidv4(),
    });
  }
}