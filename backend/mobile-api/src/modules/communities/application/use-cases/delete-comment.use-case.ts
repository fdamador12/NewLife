import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class DeleteCommentUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}
 
  async execute(comunidadId: string, postId: string, commentId: string, usuarioUuid: string) {
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
 
    const comment = await this.dbService.findById('comentarios', commentId, masterToken);
 
    if (!comment || comment.eliminado) throw new NotFoundException('Comentario no encontrado.');
    if (comment.post_id !== postId) throw new NotFoundException('Comentario no encontrado en este post.');
 
    const esModerador = membresia.es_moderador === true;
    const esAutor     = comment.autor_id === robleId;
 
    if (!esAutor && !esModerador) throw new ForbiddenException('Solo puedes eliminar tus propios comentarios.');
 
    const normalize = (r: any): any[] => Array.isArray(r) ? r : (r?.rows || []);

    // Cascade: replies → reply likes → comment likes
    const repliesRes = await this.dbService.find('comentario_respuestas', { comentario_id: commentId }, masterToken);
    await Promise.all(
      normalize(repliesRes).map(async (reply: any) => {
        const replyLikesRes = await this.dbService.find('comentario_respuesta_likes', { respuesta_id: reply._id }, masterToken);
        await Promise.all(
          normalize(replyLikesRes).map((l: any) =>
            this.dbService.delete('comentario_respuesta_likes', '_id', l._id, masterToken),
          ),
        );
        await this.dbService.update('comentario_respuestas', '_id', reply._id, { eliminado: true }, masterToken);
      }),
    );

    const commentLikesRes = await this.dbService.find('comentario_likes', { comentario_id: commentId }, masterToken);
    await Promise.all(
      normalize(commentLikesRes).map((l: any) =>
        this.dbService.delete('comentario_likes', '_id', l._id, masterToken),
      ),
    );

    await this.dbService.update('comentarios', '_id', commentId, { eliminado: true }, masterToken);
    return { message: 'Comentario eliminado exitosamente.' };
  }
}