import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class LikeCommentUseCase {
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
    if (membRows.length === 0) throw new ForbiddenException('No eres miembro de esta comunidad.');

    const comment = await this.dbService.findById('comentarios', commentId, masterToken);
    if (!comment || comment.eliminado) throw new NotFoundException('Comentario no encontrado.');

    const likeRes = await this.dbService.find(
      'comentario_likes',
      { comentario_id: commentId, usuario_id: robleId },
      masterToken,
    );
    const likes = Array.isArray(likeRes) ? likeRes : (likeRes.rows || []);
    const existing = likes[0];

    if (existing) {
      await this.dbService.delete('comentario_likes', '_id', existing._id, masterToken);
    } else {
      await this.dbService.insert('comentario_likes', [{
        comentario_id: commentId,
        usuario_id: robleId,
        created_at: new Date().toISOString(),
      }], masterToken);
    }

    const allLikesRes = await this.dbService.find(
      'comentario_likes',
      { comentario_id: commentId },
      masterToken,
    );
    const allLikes = Array.isArray(allLikesRes) ? allLikesRes : (allLikesRes.rows || []);

    return {
      accion: existing ? 'removed' : 'added',
      total_likes: allLikes.length,
    };
  }
}
