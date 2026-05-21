import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class ReplyForumUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(comunidadId: string, foroId: string, usuarioId: string, contenido: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    // 1. Verificar membresía y acceso
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: usuarioId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];

    if (!membresia) {
      throw new ForbiddenException('No eres miembro de esta comunidad.');
    }
    if (membresia.tipo_acceso === 'SOLO_VER') {
      throw new ForbiddenException('Tu tipo de acceso no permite responder foros.');
    }

    // 2. Verificar que el foro existe y está activo
    const foroRes = await this.dbService.find('foros', { _id: foroId }, masterToken);
    const foroRows = Array.isArray(foroRes) ? foroRes : (foroRes.rows || []);
    const foro = foroRows[0];

    if (!foro || foro.comunidad_id !== comunidadId) {
      throw new NotFoundException('Foro no encontrado.');
    }
    if (foro.activo === false) {
      throw new ForbiddenException('Este foro ya no está activo.');
    }

    // 3. Crear respuesta
    const now = new Date().toISOString();
    const newReply = {
      foro_id:    foroId,
      autor_id:   usuarioId,
      contenido,
      created_at: now,
      eliminado:  false,
    };

    const result = await this.dbService.insert('foros_respuestas', [newReply], masterToken);
    const inserted = result?.inserted?.[0] || result?.[0] || newReply;

    return {
      id:         inserted._id,
      contenido:  inserted.contenido,
      created_at: inserted.created_at,
    };
  }
}