import {
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { RobleHttpService } from '../../../admin/infrastructure/services/roble-http.service';
import {
  IFraseDiaRepository,
  CreateFraseDiaInput,
  UpdateFraseDiaInput,
} from '../../domain/ports/frase-dia.repository.port';
import { FraseDia } from '../../domain/entities/frase-dia.entity';

const FRASES_DIA_TABLE = 'frases_dia';

@Injectable()
export class RobleFraseDiaRepository implements IFraseDiaRepository {
  constructor(private readonly roble: RobleHttpService) {}

  private mapFraseDia(row: Record<string, unknown>): FraseDia {
    return new FraseDia({
      _id: row._id as string,
      frase_id: row.frase_id as string,
      frase: row.frase as string,
      dia: row.dia as string,
      fecha_actualiz: row.fecha_actualiz as string,
    });
  }

  async findAll(): Promise<FraseDia[]> {
    const rows = await this.roble.dbRead<unknown[]>(FRASES_DIA_TABLE, {});
    if (!rows || rows.length === 0) return [];
    return (rows as Record<string, unknown>[]).map((r) => this.mapFraseDia(r));
  }

  async findById(id: string): Promise<FraseDia | null> {
    const rows = await this.roble.dbRead<unknown[]>(FRASES_DIA_TABLE, { _id: id });
    if (!rows || rows.length === 0) return null;
    return this.mapFraseDia(rows[0] as Record<string, unknown>);
  }

  async findByDate(dia: string): Promise<FraseDia | null> {
    const rows = await this.roble.dbRead<unknown[]>(FRASES_DIA_TABLE, { dia });
    if (!rows || rows.length === 0) return null;
    return this.mapFraseDia(rows[0] as Record<string, unknown>);
  }

  async create(data: CreateFraseDiaInput): Promise<FraseDia> {
    const result = await this.roble.dbInsert<{
      inserted: Record<string, unknown>[];
      skipped: unknown[];
    }>(FRASES_DIA_TABLE, [
      {
        frase_id: data.frase_id,
        frase: data.frase,
        dia: data.dia,
        fecha_actualiz: new Date().toISOString(),
      },
    ]);

    if (!result.inserted || result.inserted.length === 0) {
      throw new InternalServerErrorException(
        `No se pudo crear la frase del día. Skipped: ${JSON.stringify(result.skipped)}`,
      );
    }

    return this.mapFraseDia(result.inserted[0]);
  }

  async update(id: string, data: UpdateFraseDiaInput): Promise<FraseDia> {
    const updates: Record<string, unknown> = {};
    if (data.frase !== undefined) updates.frase = data.frase;
    if (data.dia !== undefined) updates.dia = data.dia;
    
    updates.fecha_actualiz = new Date().toISOString();

    const updated = await this.roble.dbUpdate<Record<string, unknown>>(
      FRASES_DIA_TABLE,
      '_id',
      id,
      updates,
    );

    if (!updated) {
      throw new NotFoundException(`Frase del día ${id} no encontrada.`);
    }

    return this.mapFraseDia(updated);
  }
}