import { Injectable, Inject } from '@nestjs/common';
import { CONTENIDO_REPOSITORY } from '../../../domain/ports/contenido.repository.port';
import type { IContenidoRepository } from '../../../domain/ports/contenido.repository.port';

@Injectable()
export class GetAllContenidoUseCase {
  constructor(@Inject(CONTENIDO_REPOSITORY) private readonly repo: IContenidoRepository) {}
  async execute() { return this.repo.findAll(); }
}