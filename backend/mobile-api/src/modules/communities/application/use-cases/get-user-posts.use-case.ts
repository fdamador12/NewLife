import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetUserPostsUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    // 1. Resolver el _id de Roble del usuario logueado (con avatar)
    const userRes = await this.dbService.find('usuarios', { usuario_id: usuarioUuid }, masterToken);
    const userRows = Array.isArray(userRes) ? userRes : (userRes.rows || []);
    if (!userRows[0]) return [];
    const user = userRows[0];
    const robleId = user._id;

    // 2. Buscar posts del usuario
    const postsRes = await this.dbService.find('posts', { autor_id: robleId }, masterToken);
    const allPosts = Array.isArray(postsRes) ? postsRes : (postsRes.rows || []);
    const posts = allPosts.filter((p: any) => !p.eliminado);

    // 3. Enriquecer con comunidad y conteos (incluye autor con avatar)
    const enriched = await Promise.all(
      posts.map(async (post: any) => {
        const [community, commentsRes, reactionsRes] = await Promise.all([
          this.dbService.findById('comunidades', post.comunidad_id, masterToken),
          this.dbService.find('comentarios', { post_id: post._id }, masterToken),
          this.dbService.find('reacciones', { post_id: post._id }, masterToken),
        ]);
        const comments  = Array.isArray(commentsRes) ? commentsRes : (commentsRes.rows || []);
        const reactions = Array.isArray(reactionsRes) ? reactionsRes : (reactionsRes.rows || []);
        const activeComments = comments.filter((c: any) => !c.eliminado);

        return {
          id:                post._id,
          titulo:            post.titulo || null,
          contenido:         post.contenido,
          imagen_url:        post.imagen_url || null,
          created_at:        post.created_at,
          comunidad_id:      post.comunidad_id,
          comunidad_nombre:  community?.nombre || '',
          autor: {
            id: robleId,
            nombre: user.nombre || 'Usuario',
            avatar_url: user.avatar_url || null,
          },
          total_comentarios: activeComments.length,
          total_reacciones:  reactions.length,
        };
      })
    );

    return enriched.sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }
}