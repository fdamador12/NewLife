import { Injectable, Inject, ConflictException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { FraseDia } from '../../domain/entities/frase-dia.entity';
import { FRASE_DIA_REPOSITORY } from '../../domain/ports/frase-dia.repository.port';
import type { IFraseDiaRepository } from '../../domain/ports/frase-dia.repository.port';

export interface CreateFraseUseCaseInput {
  frase: string;
  dia: string;
}

@Injectable()
export class CreateFraseDiaUseCase {
  constructor(
    @Inject(FRASE_DIA_REPOSITORY)
    private readonly fraseDiaRepo: IFraseDiaRepository,
  ) {}

  async execute(input: CreateFraseUseCaseInput): Promise<FraseDia> {
    const existing = await this.fraseDiaRepo.findByDate(input.dia);
    if (existing) {
      throw new ConflictException(`Ya existe una frase del día para la fecha ${input.dia}`);
    }

    return this.fraseDiaRepo.create({
      frase: input.frase,
      dia: input.dia,
      frase_id: uuidv4(),
    });
  }
}