import { Injectable, Inject } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { CONTENIDO_REPOSITORY, CreateContenidoInput } from '../../../domain/ports/contenido.repository.port';
import type { IContenidoRepository } from '../../../domain/ports/contenido.repository.port';

@Injectable()
export class CreateContenidoUseCase {
  constructor(@Inject(CONTENIDO_REPOSITORY) private readonly repo: IContenidoRepository) {}

  async execute(input: Omit<CreateContenidoInput, 'contenido_id'>) {
    return this.repo.create({ ...input, contenido_id: uuidv4() });
  }
}