import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { RobleHttpService } from '../../infrastructure/services/roble-http.service';
import { IForoDiaRepository, CreateForoDiaInput, UpdateForoDiaInput } from '../../domain/ports/foro-dia.repository.port';
import { ForoDia } from '../../domain/entities/foro-dia.entity';

const TABLE = 'foro_del_dia';

@Injectable()
export class RobleForoDiaRepository implements IForoDiaRepository {
  constructor(private readonly roble: RobleHttpService) {}

  private mapEntity(row: any): ForoDia {
    return new ForoDia(row);
  }

  async findAll(): Promise<ForoDia[]> {
    const rows = await this.roble.dbRead<any[]>(TABLE, {});
    return (rows || []).map(r => this.mapEntity(r));
  }

  async findById(id: string): Promise<ForoDia | null> {
    const rows = await this.roble.dbRead<any[]>(TABLE, { _id: id });
    return rows && rows.length > 0 ? this.mapEntity(rows[0]) : null;
  }

  async findByDate(fecha: string): Promise<ForoDia | null> {
    const rows = await this.roble.dbRead<any[]>(TABLE, { fecha });
    return rows && rows.length > 0 ? this.mapEntity(rows[0]) : null;
  }

  async create(data: CreateForoDiaInput): Promise<ForoDia> {
    const now = new Date().toISOString();
    const payload = { 
      ...data, 
      _id: uuidv4(),
      creado_por: 'admin-system', 
      created_at: now 
    };

    const result = await this.roble.dbInsert<{ inserted: any[], skipped: any[] }>(TABLE, [payload]);
    if (!result.inserted || result.inserted.length === 0) {
      throw new InternalServerErrorException('Error al crear el foro del día.');
    }
    return this.mapEntity(result.inserted[0]);
  }

  // Lógica de carga masiva
  async createBulk(data: CreateForoDiaInput[]): Promise<void> {
    const now = new Date().toISOString();
    const payloads = data.map(item => ({
      ...item,
      _id: uuidv4(),
      creado_por: 'admin-system',
      created_at: now
    }));

    const result = await this.roble.dbInsert<{ inserted: any[], skipped: any[] }>(TABLE, payloads);
    if (!result.inserted || result.inserted.length === 0) {
      throw new InternalServerErrorException('Error al insertar foros masivamente.');
    }
  }

  async update(id: string, data: UpdateForoDiaInput): Promise<ForoDia> {
    const updated = await this.roble.dbUpdate<any>(TABLE, '_id', id, data);
    if (!updated) throw new NotFoundException('Foro no encontrado.');
    return this.mapEntity(updated);
  }
}