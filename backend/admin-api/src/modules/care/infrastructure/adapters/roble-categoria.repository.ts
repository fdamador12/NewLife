import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RobleHttpService } from '../../../admin/infrastructure/services/roble-http.service';
import { ICategoriaRepository, CreateCategoriaInput, UpdateCategoriaInput } from '../../domain/ports/categoria.repository.port';
import { Categoria } from '../../domain/entities/categoria.entity';

const TABLE = 'categorias_contenido';

@Injectable()
export class RobleCategoriaRepository implements ICategoriaRepository {
  constructor(private readonly roble: RobleHttpService) {}

  private mapEntity(row: any): Categoria {
    return new Categoria(row);
  }

  async findAll(): Promise<Categoria[]> {
    const rows = await this.roble.dbRead<any[]>(TABLE, {});
    return (rows || []).map(r => this.mapEntity(r));
  }

  async findById(id: string): Promise<Categoria | null> {
    const rows = await this.roble.dbRead<any[]>(TABLE, { categoria_id: id });
    return rows && rows.length > 0 ? this.mapEntity(rows[0]) : null;
  }

  async create(data: CreateCategoriaInput): Promise<Categoria> {
    const payload = { ...data, created_at: new Date().toISOString() };
    const result = await this.roble.dbInsert<{ inserted: any[], skipped: any[] }>(TABLE, [payload]);
    
    if (!result.inserted || result.inserted.length === 0) {
      throw new InternalServerErrorException('Error al crear la categoría.');
    }
    return this.mapEntity(result.inserted[0]);
  }

  async update(id: string, data: UpdateCategoriaInput): Promise<Categoria> {
    const updated = await this.roble.dbUpdate<any>(TABLE, 'categoria_id', id, data);
    if (!updated) throw new NotFoundException('Categoría no encontrada.');
    return this.mapEntity(updated);
  }

  async delete(id: string): Promise<void> {
    await this.roble.dbDelete(TABLE, 'categoria_id', id);
  }
}