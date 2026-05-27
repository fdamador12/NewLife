import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';
 
@Injectable()
export class DeletePostUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}
 
  async execute(comunidadId: string, postId: string, usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);
 
    const post = await this.dbService.findById('posts', postId, masterToken);
 
    if (!post || post.eliminado) throw new NotFoundException('Post no encontrado.');
    if (post.comunidad_id !== comunidadId) throw new NotFoundException('Post no encontrado en esta comunidad.');
 
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];
 
    if (!membresia) throw new ForbiddenException('No eres miembro de esta comunidad.');
 
    const esModerador = membresia.es_moderador === true;
    const esAutor     = post.autor_id === robleId;
 
    if (!esAutor && !esModerador) throw new ForbiddenException('Solo puedes eliminar tus propios posts.');
 
    const normalize = (r: any): any[] => Array.isArray(r) ? r : (r?.rows || []);

    // Delete post reactions
    const reaccionesRes = await this.dbService.find('reacciones', { post_id: postId }, masterToken);
    await Promise.all(
      normalize(reaccionesRes).map((r: any) =>
        this.dbService.delete('reacciones', '_id', r._id, masterToken),
      ),
    );

    // Cascade: comments → replies → reply likes → comment likes
    const commentsRes = await this.dbService.find('comentarios', { post_id: postId }, masterToken);
    await Promise.all(
      normalize(commentsRes).map(async (comment: any) => {
        const repliesRes = await this.dbService.find('comentario_respuestas', { comentario_id: comment._id }, masterToken);
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

        const commentLikesRes = await this.dbService.find('comentario_likes', { comentario_id: comment._id }, masterToken);
        await Promise.all(
          normalize(commentLikesRes).map((l: any) =>
            this.dbService.delete('comentario_likes', '_id', l._id, masterToken),
          ),
        );

        await this.dbService.update('comentarios', '_id', comment._id, { eliminado: true }, masterToken);
      }),
    );

    await this.dbService.update('posts', '_id', postId, { eliminado: true }, masterToken);
    return { message: 'Post eliminado exitosamente.' };
  }
}