import { Injectable, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { v4 as uuidv4 } from 'uuid';
import { CreateAgendaEventDto, UpdateAgendaEventDto } from '../../presentation/dtos/agenda.dto';

@Injectable()
export class AgendaUseCase {
  constructor(
    private readonly db: DatabaseService,
    private readonly systemAuth: SystemAuthService
  ) {}

  async findAll(usuarioId: string, userToken: string) {
    const result = await this.db.find('agenda', { usuario_id: usuarioId }, userToken);
    const eventos = Array.isArray(result) ? result : (result?.rows ?? []);
    
    eventos.sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
    return { data: eventos };
  }

  async create(usuarioId: string, dto: CreateAgendaEventDto, userToken: string) {
    const now = new Date().toISOString();
    const payload = {
      ...dto,
      evento_id: uuidv4(),
      usuario_id: usuarioId,
      created_at: now,
      updated_at: now
    };

    const result = await this.db.insert('agenda', [payload], userToken);

    if (!result || !result.inserted || result.inserted.length === 0) {
      console.error('Error de inserción en Roble:', result?.skipped);
      throw new InternalServerErrorException('Error al guardar el evento en la agenda. Verifica el formato de hora (puede que requiera HH:mm:ss).');
    }

    return result.inserted[0];
  }

  async update(eventoId: string, usuarioId: string, dto: UpdateAgendaEventDto, userToken: string) {
    const existing = await this.db.find('agenda', { evento_id: eventoId, usuario_id: usuarioId }, userToken);
    const rows = Array.isArray(existing) ? existing : (existing?.rows ?? []);
    
    if (rows.length === 0) throw new NotFoundException('Evento no encontrado');

    const updates = {
      ...dto,
      updated_at: new Date().toISOString()
    };

    const updated = await this.db.update('agenda', 'evento_id', eventoId, updates, userToken);
    return updated;
  }

  async delete(eventoId: string, usuarioId: string, userToken: string) {
    const existing = await this.db.find('agenda', { evento_id: eventoId, usuario_id: usuarioId }, userToken);
    const rows = Array.isArray(existing) ? existing : (existing?.rows ?? []);
    
    if (rows.length === 0) throw new NotFoundException('Evento no encontrado');

    await this.db.delete('agenda', 'evento_id', eventoId, userToken);
    return { message: 'Evento eliminado exitosamente' };
  }
}