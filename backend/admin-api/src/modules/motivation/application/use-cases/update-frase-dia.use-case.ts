import { Injectable, Inject, NotFoundException, ConflictException } from '@nestjs/common';
import { FraseDia } from '../../domain/entities/frase-dia.entity';
import { FRASE_DIA_REPOSITORY, UpdateFraseDiaInput } from '../../domain/ports/frase-dia.repository.port';
import type { IFraseDiaRepository } from '../../domain/ports/frase-dia.repository.port';

@Injectable()
export class UpdateFraseDiaUseCase {
  constructor(
    @Inject(FRASE_DIA_REPOSITORY)
    private readonly fraseDiaRepo: IFraseDiaRepository,
  ) {}

  async execute(diaTarget: string, input: UpdateFraseDiaInput): Promise<FraseDia> {
    // 1. Buscamos la frase usando la fecha en lugar del ID
    const existing = await this.fraseDiaRepo.findByDate(diaTarget);
    if (!existing) {
      throw new NotFoundException(`No hay una frase registrada para la fecha ${diaTarget}`);
    }

    // 2. Si quieren cambiar la fecha a una nueva, validamos que el nuevo día esté libre
    if (input.dia && input.dia !== existing.dia) {
      const existingForDate = await this.fraseDiaRepo.findByDate(input.dia);
      if (existingForDate) {
        throw new ConflictException(`Ya existe otra frase del día programada para la nueva fecha ${input.dia}`);
      }
    }

    // 3. Roble igual necesita el _id interno para hacer el UPDATE, así que lo sacamos del objeto que encontramos
    return this.fraseDiaRepo.update(existing._id, input);
  }
}