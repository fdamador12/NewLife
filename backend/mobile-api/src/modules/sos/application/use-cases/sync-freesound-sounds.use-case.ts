import { Injectable, Logger } from '@nestjs/common';
import { BreathingSoundsRepository } from '../../infrastructure/services/breathing-sounds.repository';
import { BreathingSoundEntity } from '../../domain/entities/breathing-sound.entity';
import { BREATHING_SOUNDS_CONSTANTS } from '../../../../shared/constants/breathing-sounds.constants';

@Injectable()
export class SyncFreesoundSoundsUseCase {
  private readonly logger = new Logger('SyncFreesoundSoundsUseCase');

  constructor(private repository: BreathingSoundsRepository) {}

  /**
   * Sincroniza 5 sonidos preseleccionados
   * Los sonidos son FIJOS - siempre los mismos para todos
   */
  async execute(token: string): Promise<void> {
    try {
      this.logger.log('🎵 Sincronizando 5 sonidos ambientales preseleccionados...');

      const defaultSounds = BREATHING_SOUNDS_CONSTANTS.DEFAULT_SOUNDS;

      for (const soundData of defaultSounds) {
        const breathingSound = new BreathingSoundEntity({
          _id: soundData._id,
          nombre: soundData.nombre,
          freesound_id: soundData.freesound_id,
          preview_url: soundData.preview_url,
          duracion_segundos: soundData.duracion_segundos,
          es_activo: soundData.es_activo,
        });

        this.logger.log(`💾 Guardando: ${soundData.nombre}`);
        await this.repository.upsert(breathingSound, token);
      }

      this.logger.log('✅ 5 sonidos sincronizados exitosamente');
    } catch (error: any) {
      this.logger.error(`❌ Error en sincronización: ${error.message}`);
      throw error;
    }
  }
}