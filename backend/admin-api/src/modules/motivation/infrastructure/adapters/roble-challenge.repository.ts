import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RobleHttpService } from '../../../admin/infrastructure/services/roble-http.service';
import { IChallengeRepository, CreateChallengeInput, UpdateChallengeInput } from '../../domain/ports/challenge.repository.port';
import { Challenge } from '../../domain/entities/challenge.entity';

const RETOS_TABLE = 'retos';

@Injectable()
export class RobleChallengeRepository implements IChallengeRepository {
  constructor(private readonly roble: RobleHttpService) { }

  private mapChallenge(row: Record<string, unknown>): Challenge {
    return new Challenge({
      _id: row._id as string,
      reto_id: row.reto_id as string,
      titulo: row.titulo as string,
      descripcion: row.descripcion as string,
      dificultad: row.dificultad as any,
      tipo: row.tipo as any,
      target: Number(row.target),
      estado: row.estado as any,
      created_at: row.created_at as string,
      updated_at: row.updated_at as string,
    });
  }

  async findAll(): Promise<Challenge[]> {
    const rows = await this.roble.dbRead<unknown[]>(RETOS_TABLE, {});
    return (rows || []).map((r: any) => this.mapChallenge(r));
  }

  async findByRetoId(retoId: string): Promise<Challenge | null> {
    const rows = await this.roble.dbRead<unknown[]>(RETOS_TABLE, { reto_id: retoId });
    if (!rows || rows.length === 0) return null;
    return this.mapChallenge(rows[0] as Record<string, unknown>);
  }

  async create(data: CreateChallengeInput): Promise<Challenge> {
    const now = new Date().toISOString();
    const result = await this.roble.dbInsert<{ inserted: any[]; skipped: any[] }>(
      RETOS_TABLE,
      [{ ...data, created_at: now, updated_at: now }]
    );

    if (!result.inserted || result.inserted.length === 0) {
      console.error('Error Roble:', JSON.stringify(result.skipped));
      throw new InternalServerErrorException('No se pudo crear el reto. Revisa los nombres de las columnas.');
    }
    return this.mapChallenge(result.inserted[0]);
  }

  async update(retoId: string, data: UpdateChallengeInput): Promise<Challenge> {
    const updates: Record<string, any> = { ...data, updated_at: new Date().toISOString() };
    const updated = await this.roble.dbUpdate<Record<string, unknown>>(RETOS_TABLE, 'reto_id', retoId, updates);
    if (!updated) throw new NotFoundException(`Reto con UUID ${retoId} no encontrado.`);
    return this.mapChallenge(updated);
  }

  async delete(retoId: string): Promise<void> {
    await this.roble.dbDelete(RETOS_TABLE, 'reto_id', retoId);
  }

  async deleteEnrollmentsByRetoId(retoId: string): Promise<void> {
    // 1. Buscamos todas las inscripciones a este reto
    const inscripciones = await this.roble.dbRead<any[]>('user_retos', { reto_id: retoId });

    // 2. Si hay usuarios inscritos, los borramos uno por uno
    if (inscripciones && inscripciones.length > 0) {
      for (const inscripcion of inscripciones) {
        await this.roble.dbDelete('user_retos', 'user_reto_id', inscripcion.user_reto_id);
      }
    }
  }
}