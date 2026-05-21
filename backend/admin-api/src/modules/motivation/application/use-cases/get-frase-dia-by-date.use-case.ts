import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { FraseDia } from '../../domain/entities/frase-dia.entity';
import { FRASE_DIA_REPOSITORY } from '../../domain/ports/frase-dia.repository.port';
import type { IFraseDiaRepository } from '../../domain/ports/frase-dia.repository.port';

@Injectable()
export class GetFraseDiaByDateUseCase {
  constructor(
    @Inject(FRASE_DIA_REPOSITORY)
    private readonly fraseDiaRepo: IFraseDiaRepository,
  ) {}

  async execute(dia: string): Promise<FraseDia> {
    const frase = await this.fraseDiaRepo.findByDate(dia);
    if (!frase) {
      throw new NotFoundException(`No hay frase registrada para la fecha ${dia}`);
    }
    return frase;
  }
}