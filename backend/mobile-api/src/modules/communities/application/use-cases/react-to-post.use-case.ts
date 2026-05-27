import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

const VALID_REACTIONS = ['LIKE', 'LOVE', 'APOYO', 'FUERTE'];

@Injectable()
export class ReactToPostUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) { }

  async execute(comunidadId: string, postId: string, usuarioUuid: string, tipo: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    if (!VALID_REACTIONS.includes(tipo)) {
      throw new ForbiddenException(`Reacción inválida. Opciones: ${VALID_REACTIONS.join(', ')}`);
    }

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membRows.length === 0) throw new ForbiddenException('No eres miembro de esta comunidad.');

    const post = await this.dbService.findById('posts', postId, masterToken);
    
    if (!post || post.eliminado) throw new NotFoundException('Post no encontrado.');

    const reactRes = await this.dbService.find('reacciones', { post_id: postId, usuario_id: robleId }, masterToken);
    const allReactions = Array.isArray(reactRes) ? reactRes : (reactRes.rows || []);
    const existing = allReactions.find((r: any) => r.tipo === tipo);

    if (existing) {
      await this.dbService.delete('reacciones', '_id', existing._id, masterToken);
    } else {
      await this.dbService.insert('reacciones', [{
        post_id: postId,
        usuario_id: robleId,
        comunidad_id: comunidadId,
        tipo,
        created_at: new Date().toISOString(),
      }], masterToken);
    }

    const totalRes = await this.dbService.find('reacciones', { post_id: postId }, masterToken);
    const total = (Array.isArray(totalRes) ? totalRes : (totalRes.rows || [])).length;

    return {
      message: existing ? 'Reacción eliminada.' : 'Reacción agregada.',
      accion: existing ? 'removed' : 'added',
      tipo,
      total,
    };
  }
}