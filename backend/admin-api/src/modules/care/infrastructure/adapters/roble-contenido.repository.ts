import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RobleHttpService } from '../../../admin/infrastructure/services/roble-http.service';
import { IContenidoRepository, CreateContenidoInput, UpdateContenidoInput } from '../../domain/ports/contenido.repository.port';
import { ContenidoEducativo } from '../../domain/entities/contenido.entity';

const TABLE = 'contenido_educativo';

@Injectable()
export class RobleContenidoRepository implements IContenidoRepository {
  constructor(private readonly roble: RobleHttpService) {}

  private mapEntity(row: any): ContenidoEducativo {
    return new ContenidoEducativo(row);
  }

  async findAll(): Promise<ContenidoEducativo[]> {
    const rows = await this.roble.dbRead<any[]>(TABLE, {});
    return (rows || []).map(r => this.mapEntity(r));
  }

  async findById(id: string): Promise<ContenidoEducativo | null> {
    const rows = await this.roble.dbRead<any[]>(TABLE, { contenido_id: id });
    return rows && rows.length > 0 ? this.mapEntity(rows[0]) : null;
  }

  async create(data: CreateContenidoInput): Promise<ContenidoEducativo> {
    const now = new Date().toISOString();
    const payload = { 
      ...data, 
      hashtags: data.hashtags ? JSON.stringify(data.hashtags) : null, 
      created_at: now, 
      updated_at: now 
    };

    const result = await this.roble.dbInsert<{ inserted: any[], skipped: any[] }>(TABLE, [payload]);
    if (!result.inserted || result.inserted.length === 0) {
      throw new InternalServerErrorException('Error al crear el contenido.');
    }
    return this.mapEntity(result.inserted[0]);
  }

  async update(id: string, data: UpdateContenidoInput): Promise<ContenidoEducativo> {
    const updates: any = { ...data, updated_at: new Date().toISOString() };
    if (data.hashtags !== undefined) {
      updates.hashtags = data.hashtags ? JSON.stringify(data.hashtags) : null;
    }

    const updated = await this.roble.dbUpdate<any>(TABLE, 'contenido_id', id, updates);
    if (!updated) throw new NotFoundException('Contenido no encontrado.');
    return this.mapEntity(updated);
  }

  async delete(id: string): Promise<void> {
    const existing = await this.findById(id);
    if (!existing) throw new NotFoundException('Contenido no encontrado.');
    await this.roble.dbDelete(TABLE, 'contenido_id', id);
  }

  async nullifyCategoria(categoriaId: string): Promise<void> {
    const contenidosAfectados = await this.roble.dbRead<any[]>(TABLE, { categoria_id: categoriaId });
    if (contenidosAfectados && contenidosAfectados.length > 0) {
      for (const item of contenidosAfectados) {
        await this.roble.dbUpdate<any>(TABLE, 'contenido_id', item.contenido_id, { categoria_id: null });
      }
    }
  }
}