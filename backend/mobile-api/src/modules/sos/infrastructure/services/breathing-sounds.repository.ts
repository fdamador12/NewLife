import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { BreathingSoundEntity } from '../../domain/entities/breathing-sound.entity';

@Injectable()
export class BreathingSoundsRepository {
  private readonly logger = new Logger('BreathingSoundsRepository');
  private readonly tableName = 'breathing_sounds';

  constructor(private databaseService: DatabaseService) {}

  /**
   * Obtener todos los sonidos activos
   */
    async findAll(token: string): Promise<BreathingSoundEntity[]> {
    try {
        this.logger.log('📖 Obteniendo todos los sonidos...');

        const result = await this.databaseService.find(
        this.tableName,
        {},
        token
        );

        // ✅ Roble retorna result.rows, NO result.data
        let sounds = Array.isArray(result) ? result : (result?.rows ?? []);
        
        this.logger.log(`📊 Respuesta Roble estructura:`, Object.keys(sounds));
        this.logger.log(`📊 Total registros: ${sounds.length}`);

        sounds = sounds
        .filter((sound: any) => sound && sound.es_activo === true)
        .map((sound: any) => new BreathingSoundEntity(sound));

        this.logger.log(`✅ ${sounds.length} sonidos encontrados después de filtrar`);
        return sounds;
    } catch (error: any) {
        this.logger.error(`❌ Error obteniendo sonidos: ${error.message}`);
        throw error;
    }
    }

  /**
   * Obtener sonido por nombre
   */
  async findByNombre(nombre: string, token: string): Promise<BreathingSoundEntity | null> {
    try {
      this.logger.log(`🔍 Buscando sonido: ${nombre}`);

      const result = await this.databaseService.find(
        this.tableName,
        { nombre },
        token
      );

      const sounds = result?.data || [];
      return sounds.length > 0 ? new BreathingSoundEntity(sounds[0]) : null;
    } catch (error: any) {
      this.logger.error(`❌ Error buscando por nombre: ${error.message}`);
      throw error;
    }
  }

  /**
   * Crear o actualizar sonido
   */
  async upsert(sound: BreathingSoundEntity, token: string): Promise<void> {
    try {
      this.logger.log(`💾 Guardando sonido: ${sound.nombre}`);

      try {
        await this.databaseService.update(
          this.tableName,
          '_id',
          sound._id,
          {
            nombre: sound.nombre,
            preview_url: sound.preview_url,
            duracion_segundos: sound.duracion_segundos,
            es_activo: sound.es_activo ?? true,
          },
          token
        );
        this.logger.log(`✅ Sonido actualizado: ${sound.nombre}`);
      } catch (error: any) {
        this.logger.log(`📝 Creando nuevo sonido: ${sound.nombre}`);
        
        const uuidv4 = () => {
          return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
            const r = (Math.random() * 16) | 0;
            const v = c === 'x' ? r : (r & 0x3) | 0x8;
            return v.toString(16);
          });
        };

        await this.databaseService.insert(
          this.tableName,
          [
            {
              _id: sound._id,
              breathing_id: uuidv4(),
              nombre: sound.nombre,
              freesound_id: sound.freesound_id,
              preview_url: sound.preview_url,
              duracion_segundos: sound.duracion_segundos,
              es_activo: sound.es_activo ?? true,
            },
          ],
          token
        );
        this.logger.log(`✅ Sonido creado: ${sound.nombre}`);
      }
    } catch (error: any) {
      this.logger.error(`❌ Error guardando sonido: ${error.message}`);
      throw error;
    }
  }

  /**
   * Obtener sonido por ID
   */
  async findById(id: string, token: string): Promise<BreathingSoundEntity | null> {
    try {
      this.logger.log(`🔍 Buscando sonido ID: ${id}`);

      const result = await this.databaseService.find(
        this.tableName,
        { _id: id },
        token
      );

      const sounds = result?.data || [];
      return sounds.length > 0 ? new BreathingSoundEntity(sounds[0]) : null;
    } catch (error: any) {
      this.logger.error(`❌ Error buscando por ID: ${error.message}`);
      throw error;
    }
  }
}