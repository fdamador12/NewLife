import { Injectable, Logger } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { IPetProviderPort } from '../../domain/ports/pet-provider.port';
import { PetEntity } from '../../domain/entities/pet.entity';

@Injectable()
export class RoblePetAdapter implements IPetProviderPort {
  private logger = new Logger(RoblePetAdapter.name);

  constructor(private readonly dbService: DatabaseService) {}

  async getPet(usuarioId: string, masterToken: string): Promise<PetEntity | null> {
    try {
      const result = await this.dbService.find('user_pet', { usuario_id: usuarioId }, masterToken);
      const rows = Array.isArray(result) ? result : (result?.rows ?? []);
      if (!rows[0]) return null;

      const row = rows[0];
      const raw = row.unlocked_forms;

      return {
        _id: row._id,
        usuario_id: row.usuario_id,
        xp: row.xp ?? 0,
        selected_form: row.selected_form ?? 'seed',
        unlocked_forms: Array.isArray(raw)
          ? raw
          : typeof raw === 'string'
            ? JSON.parse(raw)
            : ['seed'],
        updated_at: row.updated_at,
      };
    } catch (error) {
      this.logger.error('Error en getPet:', error);
      return null;
    }
  }

  async upsertPet(data: Partial<PetEntity>, masterToken: string): Promise<void> {
    try {
      const existing = await this.dbService.find(
        'user_pet',
        { usuario_id: data.usuario_id },
        masterToken,
      );
      const rows = Array.isArray(existing) ? existing : (existing?.rows ?? []);
      const now = new Date().toISOString();

      if (rows.length > 0) {
        await this.dbService.update(
          'user_pet',
          'usuario_id',
          data.usuario_id,
          {
            xp: data.xp,
            selected_form: data.selected_form,
            unlocked_forms: JSON.stringify(data.unlocked_forms),
            updated_at: now,
          },
          masterToken,
        );
      } else {
        await this.dbService.insert('user_pet', [{
          usuario_id: data.usuario_id,
          xp: data.xp ?? 0,
          selected_form: data.selected_form ?? 'seed',
          unlocked_forms: JSON.stringify(data.unlocked_forms ?? ['seed']),
          updated_at: now,
        }], masterToken);
      }
    } catch (error) {
      this.logger.error('Error en upsertPet:', error);
      throw error;
    }
  }
}