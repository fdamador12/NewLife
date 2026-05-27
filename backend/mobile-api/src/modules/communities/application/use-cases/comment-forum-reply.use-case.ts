import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class CommentForumReplyUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(
    foroId: string,
    comunidadId: string,
    respuestaId: string,
    usuarioUuid: string,
    contenido: string,
  ) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    // Verificar membresía y acceso
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];

    if (!membresia) throw new ForbiddenException('No eres miembro de esta comunidad.');
    if (membresia.tipo_acceso === 'SOLO_VER') {
      throw new ForbiddenException('Tu tipo de acceso no permite comentar.');
    }

    // Verificar que el foro es de hoy
    const foro = await this.dbService.findById('foro_del_dia', foroId, masterToken);

    if (!foro) throw new NotFoundException('Foro no encontrado.');
    const today = new Date().toISOString().split('T')[0];
    if (foro.fecha !== today) {
      throw new ForbiddenException('Solo puedes comentar en el foro del día de hoy.');
    }

    // Verificar que la respuesta existe y pertenece a esta comunidad
    const respuesta = await this.dbService.findById('foros_respuestas', respuestaId, masterToken);

    if (!respuesta || respuesta.comunidad_id !== comunidadId) {
      throw new NotFoundException('Respuesta no encontrada.');
    }

    const result = await this.dbService.insert('foro_respuesta_comentarios', [{
      respuesta_id: respuestaId,
      autor_id:     robleId,
      contenido,
      created_at:   new Date().toISOString(),
      eliminado:    false,
    }], masterToken);

    const inserted = result?.inserted?.[0] || result?.[0] || {};
    return { id: inserted._id, contenido: inserted.contenido, created_at: inserted.created_at };
  }
}