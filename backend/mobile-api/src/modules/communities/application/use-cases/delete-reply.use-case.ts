import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class DeleteReplyUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(
    comunidadId: string,
    postId: string,
    commentId: string,
    replyId: string,
    usuarioUuid: string,
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

    const reply = await this.dbService.findById('comentario_respuestas', replyId, masterToken);
    if (!reply || reply.eliminado) throw new NotFoundException('Respuesta no encontrada.');
    if (reply.comentario_id !== commentId) throw new NotFoundException('Respuesta no encontrada en este comentario.');

    const esModerador = membresia.es_moderador === true;
    const esAutor     = reply.autor_id === robleId;
    if (!esAutor && !esModerador) throw new ForbiddenException('Solo puedes eliminar tus propias respuestas.');

    const normalize = (r: any): any[] => Array.isArray(r) ? r : (r?.rows || []);

    const replyLikesRes = await this.dbService.find('comentario_respuesta_likes', { respuesta_id: replyId }, masterToken);
    await Promise.all(
      normalize(replyLikesRes).map((l: any) =>
        this.dbService.delete('comentario_respuesta_likes', '_id', l._id, masterToken),
      ),
    );

    await this.dbService.update('comentario_respuestas', '_id', replyId, { eliminado: true }, masterToken);
    return { message: 'Respuesta eliminada exitosamente.' };
  }
}
