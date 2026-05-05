import { Injectable, Inject } from '@nestjs/common';
import { FORO_DIA_REPOSITORY } from '../../domain/ports/foro-dia.repository.port';
import type { IForoDiaRepository, CreateForoDiaInput } from '../../domain/ports/foro-dia.repository.port';

@Injectable()
export class CreateForosBulkUseCase {
  constructor(@Inject(FORO_DIA_REPOSITORY) private readonly repo: IForoDiaRepository) {}

  async execute(inputs: CreateForoDiaInput[]) {
    if (inputs.length === 0) return;
    await this.repo.createBulk(inputs);
  }
}