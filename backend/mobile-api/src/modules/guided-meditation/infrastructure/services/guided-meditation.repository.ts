import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { GuidedMeditationEntity } from '../../domain/entities/guided-meditation.entity';

@Injectable()
export class GuidedMeditationRepository {
  private tableName = 'guided_audios';

  constructor(private databaseService: DatabaseService) {}

  async getAll(token: string): Promise<GuidedMeditationEntity[]> {
    try {
      const result = await this.databaseService.find(
        this.tableName,
        {},
        token,
      );

      let audios = Array.isArray(result) ? result : (result?.rows ?? []);
      return audios.map((a: any) => new GuidedMeditationEntity(a));
    } catch (error) {
      console.error('Error fetching audios:', error);
      return [];
    }
  }

  async getByCategory(
    categoria: string,
    token: string,
  ): Promise<GuidedMeditationEntity[]> {
    try {
      const result = await this.databaseService.find(
        this.tableName,
        { categoria },
        token,
      );

      let audios = Array.isArray(result) ? result : (result?.rows ?? []);
      return audios.map((a: any) => new GuidedMeditationEntity(a));
    } catch (error) {
      console.error('Error fetching by category:', error);
      return [];
    }
  }

  async getById(id: string, token: string): Promise<GuidedMeditationEntity | null> {
    try {
      const result = await this.databaseService.find(
        this.tableName,
        { audio_id: id },
        token,
      );

      let audios = Array.isArray(result) ? result : (result?.rows ?? []);

      if (audios.length > 0) {
        return new GuidedMeditationEntity(audios[0]);
      }

      return null;
    } catch (error) {
      console.error('Error fetching audio:', error);
      return null;
    }
  }
}