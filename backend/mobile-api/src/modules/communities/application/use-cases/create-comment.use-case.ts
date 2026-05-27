import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class CreateCommentUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}
 
  async execute(comunidadId: string, postId: string, usuarioUuid: string, contenido: string) {
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
    if (membresia.tipo_acceso === 'SOLO_VER') throw new ForbiddenException('Tu tipo de acceso no permite comentar.');
 
    const post = await this.dbService.findById('posts', postId, masterToken);
 
    if (!post || post.eliminado) throw new NotFoundException('Post no encontrado.');
    if (post.comunidad_id !== comunidadId) throw new NotFoundException('Post no encontrado en esta comunidad.');
 
    const now = new Date().toISOString();
    const result = await this.dbService.insert('comentarios', [{
      post_id:    postId,
      autor_id:   robleId,
      comunidad_id: comunidadId,
      contenido,
      created_at: now,
      eliminado:  false,
    }], masterToken);
 
    const inserted = result?.inserted?.[0] || result?.[0] || {};
    return { id: inserted._id, contenido: inserted.contenido, created_at: inserted.created_at };
  }
}