import { Injectable, Inject } from '@nestjs/common';
import { FraseDia } from '../../domain/entities/frase-dia.entity';
import { FRASE_DIA_REPOSITORY } from '../../domain/ports/frase-dia.repository.port';
import type { IFraseDiaRepository } from '../../domain/ports/frase-dia.repository.port';

@Injectable()
export class GetAllFrasesUseCase {
  constructor(
    @Inject(FRASE_DIA_REPOSITORY)
    private readonly fraseDiaRepo: IFraseDiaRepository,
  ) {}

  async execute(): Promise<FraseDia[]> {
    return this.fraseDiaRepo.findAll();
  }
}