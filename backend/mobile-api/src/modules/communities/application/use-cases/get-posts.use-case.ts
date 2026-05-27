import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class GetPostsUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) { }

  async execute(comunidadId: string, usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membRows.length === 0) throw new ForbiddenException('No eres miembro de esta comunidad.');

    const postsRes = await this.dbService.find('posts', { comunidad_id: comunidadId }, masterToken);
    const allPosts = Array.isArray(postsRes) ? postsRes : (postsRes.rows || []);
    const posts = allPosts.filter((p: any) => !p.eliminado);

    if (posts.length === 0) return [];

    // Prefetch autores unicos (ahora incluye avatar_url)
    const autorIds = [...new Set(posts.map((p: any) => p.autor_id))] as string[];
    const autoresArr = await Promise.all(
      autorIds.map(id => this.dbService.findById('usuarios', id, masterToken)),
    );
    const autorMap = Object.fromEntries(autorIds.map((id, i) => [id, autoresArr[i]]));

    const enriched = await Promise.all(
      posts.map(async (post: any) => {
        const [commentsRes, reactionsRes] = await Promise.all([
          this.dbService.find('comentarios', { post_id: post._id }, masterToken)
            .then((r: any) => Array.isArray(r) ? r : (r.rows || [])),
          this.dbService.find('reacciones', { post_id: post._id }, masterToken)
            .then((r: any) => Array.isArray(r) ? r : (r.rows || [])),
        ]);

        const activeComments = commentsRes.filter((c: any) => !c.eliminado);
        const autor = autorMap[post.autor_id];

        return {
          id:                post._id,
          comunidad_id:      post.comunidad_id,
          titulo:            post.titulo || null,
          contenido:         post.contenido,
          imagen_url:        post.imagen_url || null,
          created_at:        post.created_at,
          edited_at:         post.edited_at,
          es_mio:            post.autor_id === robleId,
          autor: {
            id:         post.autor_id,
            nombre:     autor?.nombre || 'Usuario',
            avatar_url: autor?.avatar_url || null,
          },
          total_comentarios: activeComments.length,
          total_reacciones:  reactionsRes.length,
          mis_reacciones:    reactionsRes
            .filter((r: any) => r.usuario_id === robleId)
            .map((r: any) => r.tipo),
        };
      }),
    );

    return enriched.sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
    );
  }
}