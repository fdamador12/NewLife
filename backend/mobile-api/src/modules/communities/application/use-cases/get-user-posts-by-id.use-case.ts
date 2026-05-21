import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class GetUserPostsByIdUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(robleId: string, requestorUuid: string) {
  const masterToken = await this.systemAuth.getMasterToken();

  // Resolver _id del usuario que hace la request
  const requestorId = await this.resolveUserId.getRobleId(requestorUuid);

  // Comunidades del requestor
  const myMembRes = await this.dbService.find(
    'comunidad_usuarios', { usuario_id: requestorId }, masterToken,
  );
  const myMemb = Array.isArray(myMembRes) ? myMembRes : (myMembRes.rows || []);
  const myCommunityIds = new Set(myMemb.map((m: any) => m.comunidad_id));

  // Posts del usuario objetivo
  const postsRes = await this.dbService.find('posts', { autor_id: robleId }, masterToken);
  const allPosts = Array.isArray(postsRes) ? postsRes : (postsRes.rows || []);

  // Solo posts de comunidades en común
  const posts = allPosts.filter(
    (p: any) => !p.eliminado && myCommunityIds.has(p.comunidad_id)
  );

  // Enriquecer — igual que antes
  const enriched = await Promise.all(
    posts.map(async (post: any) => {
      const [community, commentsRes, reactionsRes] = await Promise.all([
        this.dbService.findById('comunidades', post.comunidad_id, masterToken),
        this.dbService.find('comentarios', { post_id: post._id }, masterToken),
        this.dbService.find('reacciones', { post_id: post._id }, masterToken),
      ]);
      const comments  = Array.isArray(commentsRes) ? commentsRes : (commentsRes.rows || []);
      const reactions = Array.isArray(reactionsRes) ? reactionsRes : (reactionsRes.rows || []);
      return {
        id:                post._id,
        titulo:            post.titulo || null,
        contenido:         post.contenido,
        created_at:        post.created_at,
        comunidad_id:      post.comunidad_id,
        comunidad_nombre:  community?.nombre || '',
        total_comentarios: comments.filter((c: any) => !c.eliminado).length,
        total_reacciones:  reactions.length,
      };
    })
  );

  return enriched.sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  );
}
}