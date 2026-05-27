import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class ReplyToCommentUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(
    comunidadId: string,
    postId: string,
    commentId: string,
    usuarioUuid: string,
    contenido: string,
  ) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];
    if (!membresia) throw new ForbiddenException('No eres miembro de esta comunidad.');
    if (membresia.tipo_acceso === 'SOLO_VER') throw new ForbiddenException('Tu tipo de acceso no permite responder.');

    const comment = await this.dbService.findById('comentarios', commentId, masterToken);
    if (!comment || comment.eliminado) throw new NotFoundException('Comentario no encontrado.');
    if (comment.post_id !== postId) throw new NotFoundException('El comentario no pertenece a este post.');

    const now = new Date().toISOString();
    const result = await this.dbService.insert('comentario_respuestas', [{
      comentario_id: commentId,
      autor_id: robleId,
      contenido,
      created_at: now,
      eliminado: false,
    }], masterToken);

    const inserted = result?.inserted?.[0] || result?.[0] || {};
    return { id: inserted._id, contenido: inserted.contenido, created_at: inserted.created_at };
  }
}
