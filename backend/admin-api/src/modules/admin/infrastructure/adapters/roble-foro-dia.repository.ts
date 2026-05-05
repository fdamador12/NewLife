import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
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
      // _id lo autogenera ROBLE
      creado_por: 'admin-system',
      created_at: now,
    };

    const result = await this.roble.dbInsert<{ inserted: any[]; skipped: any[] }>(
      TABLE,
      [payload],
    );

    if (!result.inserted || result.inserted.length === 0) {
      throw new InternalServerErrorException(
        `No se pudo crear el foro del día. Skipped: ${JSON.stringify(result.skipped)}`,
      );
    }
    return this.mapEntity(result.inserted[0]);
  }

  async createBulk(data: CreateForoDiaInput[]): Promise<void> {
    const now = new Date().toISOString();
    const payloads = data.map(item => ({
      ...item,
      // _id lo autogenera ROBLE
      creado_por: 'admin-system',
      created_at: now,
    }));

    const result = await this.roble.dbInsert<{ inserted: any[]; skipped: any[] }>(
      TABLE,
      payloads,
    );

    if (!result.inserted || result.inserted.length === 0) {
      throw new InternalServerErrorException(
        `No se pudieron insertar los foros masivamente. Skipped: ${JSON.stringify(result.skipped)}`,
      );
    }

    if (result.skipped && result.skipped.length > 0) {
      console.warn(`Carga masiva parcial: ${result.inserted.length} insertados, ${result.skipped.length} rechazados`, result.skipped);
    }
  }

  async update(id: string, data: UpdateForoDiaInput): Promise<ForoDia> {
    const updated = await this.roble.dbUpdate<any>(TABLE, '_id', id, data);
    if (!updated) throw new NotFoundException('Foro no encontrado.');
    return this.mapEntity(updated);
  }
}