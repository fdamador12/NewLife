import { Injectable, Logger } from '@nestjs/common';
import { BreathingSoundsRepository } from '../../infrastructure/services/breathing-sounds.repository';
import { BreathingSoundEntity } from '../../domain/entities/breathing-sound.entity';

@Injectable()
export class GetBreathingSoundsUseCase {
  private readonly logger = new Logger('GetBreathingSoundsUseCase');

  constructor(private repository: BreathingSoundsRepository) {}

  /**
   * Obtiene todos los sonidos disponibles
   */
  async getAllSounds(token: string): Promise<BreathingSoundEntity[]> {
    try {
      this.logger.log('📖 Obteniendo todos los sonidos...');
      const sounds = await this.repository.findAll(token);
      this.logger.log(`✅ ${sounds.length} sonidos obtenidos`);
      return sounds;
    } catch (error: any) {
      this.logger.error(`❌ Error obteniendo sonidos: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene sonido por nombre
   */
  async getSoundByNombre(
    nombre: string,
    token: string
  ): Promise<BreathingSoundEntity | null> {
    try {
      this.logger.log(`🔍 Buscando sonido: ${nombre}`);
      const sound = await this.repository.findByNombre(nombre, token);
      return sound;
    } catch (error: any) {
      this.logger.error(`❌ Error obteniendo sonido: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtiene sonido por ID
   */
  async getSoundById(
    id: string,
    token: string
  ): Promise<BreathingSoundEntity | null> {
    try {
      this.logger.log(`🔍 Buscando sonido ID: ${id}`);
      const sound = await this.repository.findById(id, token);
      return sound;
    } catch (error: any) {
      this.logger.error(`❌ Error obteniendo sonido: ${error.message}`);
      throw error;
    }
  }
}