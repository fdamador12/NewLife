import { Injectable, Inject } from '@nestjs/common';
import { FORO_DIA_REPOSITORY } from '../../domain/ports/foro-dia.repository.port';
import type { IForoDiaRepository } from '../../domain/ports/foro-dia.repository.port';

@Injectable()
export class GetAllForosUseCase {
  constructor(@Inject(FORO_DIA_REPOSITORY) private readonly repo: IForoDiaRepository) {}

  async execute() {
    return this.repo.findAll();
  }
}