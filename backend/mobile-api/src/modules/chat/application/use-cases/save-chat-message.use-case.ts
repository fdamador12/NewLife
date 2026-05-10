import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class SaveChatMessageUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(comunidadId: string, autorId: string, autorNombre: string, contenido: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: autorId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];

    if (!membresia) throw new ForbiddenException('No eres miembro de esta comunidad.');
    if (membresia.tipo_acceso !== 'CHAT_COMPLETO') {
      throw new ForbiddenException('Tu tipo de acceso no permite enviar mensajes en el chat.');
    }

    const now = new Date().toISOString();
    const result = await this.dbService.insert('mensajes_chat', [{
      comunidad_id: comunidadId,
      autor_id:     autorId,
      autor_nombre: autorNombre,
      contenido,
      created_at:   now,
      eliminado:    false,
    }], masterToken);

    const inserted = result?.inserted?.[0] || result?.[0] || {};
    return {
      id:           inserted._id,
      comunidad_id: comunidadId,
      autor_id:     autorId,
      autor_nombre: autorNombre,
      contenido,
      created_at:   now,
    };
  }
}
