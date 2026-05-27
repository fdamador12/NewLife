import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class LikeForumReplyUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) { }

  async execute(comunidadId: string, respuestaId: string, usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    // Verificar membresía
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membRows.length === 0) throw new ForbiddenException('No eres miembro de esta comunidad.');

    // Verificar que la respuesta existe
    const respuesta = await this.dbService.findById('foros_respuestas', respuestaId, masterToken);
    if (!respuesta) throw new NotFoundException('Respuesta no encontrada.');

    // Toggle like
    const likeRes = await this.dbService.find(
      'foro_respuesta_likes',
      { respuesta_id: respuestaId, usuario_id: robleId },
      masterToken,
    );
    const likes = Array.isArray(likeRes) ? likeRes : (likeRes.rows || []);
    const existing = likes[0];

    if (existing) {
      await this.dbService.delete('foro_respuesta_likes', '_id', existing._id, masterToken);
      return { accion: 'removed' };
    }

    await this.dbService.insert('foro_respuesta_likes', [{
      respuesta_id: respuestaId,
      usuario_id: robleId,
      created_at: new Date().toISOString(),
    }], masterToken);

    return { accion: 'added' };
  }
}