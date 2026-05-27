import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class GetCommentsUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(comunidadId: string, postId: string, usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membRows.length === 0) throw new ForbiddenException('No eres miembro de esta comunidad.');

    const post = await this.dbService.findById('posts', postId, masterToken);
    if (!post || post.eliminado) throw new NotFoundException('Post no encontrado.');

    const commRes = await this.dbService.find('comentarios', { post_id: postId }, masterToken);
    const allComments = Array.isArray(commRes) ? commRes : (commRes.rows || []);
    const comments = allComments.filter((c: any) => !c.eliminado);

    const enriched = await Promise.all(
      comments.map(async (comment: any) => {
        const [autor, likesRes, respuestasRes] = await Promise.all([
          this.dbService.findById('usuarios', comment.autor_id, masterToken),
          this.dbService.find('comentario_likes', { comentario_id: comment._id }, masterToken),
          this.dbService.find('comentario_respuestas', { comentario_id: comment._id }, masterToken),
        ]);

        const commentLikes = Array.isArray(likesRes) ? likesRes : (likesRes.rows || []);
        const respuestasRaw = Array.isArray(respuestasRes) ? respuestasRes : (respuestasRes.rows || []);
        const respuestasFiltradas = respuestasRaw.filter((r: any) => !r.eliminado);

        const respuestas = await Promise.all(
          respuestasFiltradas.map(async (respuesta: any) => {
            const [rAutor, rLikesRes] = await Promise.all([
              this.dbService.findById('usuarios', respuesta.autor_id, masterToken),
              this.dbService.find('comentario_respuesta_likes', { respuesta_id: respuesta._id }, masterToken),
            ]);
            const rLikes = Array.isArray(rLikesRes) ? rLikesRes : (rLikesRes.rows || []);
            return {
              id: respuesta._id,
              contenido: respuesta.contenido,
              created_at: respuesta.created_at,
              es_mio: respuesta.autor_id === robleId,
              autor: {
                id: respuesta.autor_id,
                nombre: rAutor?.nombre || 'Usuario',
                avatar_url: rAutor?.avatar_url || null,
              },
              total_likes: rLikes.length,
              yo_di_like: rLikes.some((l: any) => l.usuario_id === robleId),
            };
          })
        );

        return {
          id: comment._id,
          contenido: comment.contenido,
          created_at: comment.created_at,
          es_mio: comment.autor_id === robleId,
          autor: {
            id: comment.autor_id,
            nombre: autor?.nombre || 'Usuario',
            avatar_url: autor?.avatar_url || null,
          },
          total_likes: commentLikes.length,
          yo_di_like: commentLikes.some((l: any) => l.usuario_id === robleId),
          respuestas: respuestas.sort(
            (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
          ),
        };
      })
    );

    return enriched.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
    );
  }
}