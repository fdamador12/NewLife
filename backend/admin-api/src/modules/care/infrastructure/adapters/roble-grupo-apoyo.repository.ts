import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { RobleHttpService } from '../../../admin/infrastructure/services/roble-http.service';
import { IGrupoApoyoRepository, CreateGrupoInput, UpdateGrupoInput } from '../../domain/ports/grupo-apoyo.repository.port';
import { GrupoApoyo } from '../../domain/entities/grupo-apoyo.entity';

const TABLE = 'grupos_apoyo';

@Injectable()
export class RobleGrupoApoyoRepository implements IGrupoApoyoRepository {
    constructor(private readonly roble: RobleHttpService) { }

    private mapEntity(row: any): GrupoApoyo {
        return new GrupoApoyo(row);
    }

    async findAll(): Promise<GrupoApoyo[]> {
        const rows = await this.roble.dbRead<any[]>(TABLE, {});
        return (rows || []).map(r => this.mapEntity(r));
    }

    async findById(grupoId: string): Promise<GrupoApoyo | null> {
        const rows = await this.roble.dbRead<any[]>(TABLE, { grupo_id: grupoId });
        return rows && rows.length > 0 ? this.mapEntity(rows[0]) : null;
    }

    async create(data: CreateGrupoInput): Promise<GrupoApoyo> {
        const now = new Date().toISOString();

        const payload = {
            ...data,
            telefonos: data.telefonos ? JSON.stringify(data.telefonos) : null,
            whatsapp: data.whatsapp ? JSON.stringify(data.whatsapp) : null,
            created_at: now,
            updated_at: now,
        };

        const result = await this.roble.dbInsert<{ inserted: any[], skipped: any[] }>(TABLE, [payload]);

        if (!result.inserted || result.inserted.length === 0) {
            console.error('Error Roble:', JSON.stringify(result.skipped, null, 2));
            throw new InternalServerErrorException('Error al crear el grupo de apoyo.');
        }

        return this.mapEntity(result.inserted[0]);
    }

    async update(grupoId: string, data: UpdateGrupoInput): Promise<GrupoApoyo> {
        const updates: any = {
            ...data,
            updated_at: new Date().toISOString()
        };

        if (data.telefonos !== undefined) {
            updates.telefonos = data.telefonos ? JSON.stringify(data.telefonos) : null;
        }
        if (data.whatsapp !== undefined) {
            updates.whatsapp = data.whatsapp ? JSON.stringify(data.whatsapp) : null;
        }

        const updated = await this.roble.dbUpdate<any>(TABLE, 'grupo_id', grupoId, updates);

        if (!updated) throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado.`);

        return this.mapEntity(updated);
    }

    async delete(grupoId: string): Promise<void> {
        const existing = await this.findById(grupoId);
        if (!existing) throw new NotFoundException(`Grupo con ID ${grupoId} no encontrado.`);
        
        await this.roble.dbDelete(TABLE, 'grupo_id', grupoId);
    }
}