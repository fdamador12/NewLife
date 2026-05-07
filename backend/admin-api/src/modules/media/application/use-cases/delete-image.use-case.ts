import { Injectable, Inject, Logger, BadRequestException } from '@nestjs/common';
import { MEDIA_STORAGE_PORT } from '../../domain/ports/media-storage.port';
import type { IMediaStoragePort } from '../../domain/ports/media-storage.port';
import { ALLOWED_CATEGORIES } from './upload-image.use-case';

@Injectable()
export class DeleteImageUseCase {
  private readonly logger = new Logger(DeleteImageUseCase.name);

  constructor(
    @Inject(MEDIA_STORAGE_PORT)
    private readonly storage: IMediaStoragePort,
  ) {}

  /**
   * Borra una imagen del bucket público.
   * @param key Key del archivo (ej: "covers/abc-def.webp")
   */
  async execute(key: string): Promise<void> {
    // Validar que el key tenga el formato esperado (previene borrado arbitrario)
    this.validateKey(key);

    await this.storage.delete('public', key);
    this.logger.log(`Imagen borrada: ${key}`);
  }

  /**
   * Valida que la key sea segura: una categoría conocida + UUID + extensión .webp.
   * Esto previene que alguien envíe keys raras como "../../system" o keys ajenas.
   */
  private validateKey(key: string): void {
    // Formato esperado: "<categoria>/<uuid>.<extension>"
    const match = key.match(/^([a-z]+)\/([a-f0-9-]{36})\.([a-z0-9]+)$/i);
    if (!match) {
      throw new BadRequestException('Formato de key inválido.');
    }

    const [, category] = match;
    if (!ALLOWED_CATEGORIES.includes(category as (typeof ALLOWED_CATEGORIES)[number])) {
      throw new BadRequestException(`Categoría no permitida: ${category}`);
    }
  }
}