import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class CreatePostUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}
 
  async execute(comunidadId: string, usuarioUuid: string, contenido: string, titulo?: string) {
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
    if (membresia.tipo_acceso === 'SOLO_VER') {
      throw new ForbiddenException('Tu tipo de acceso no permite publicar en esta comunidad.');
    }
 
    const now = new Date().toISOString();
    const result = await this.dbService.insert('posts', [{
      comunidad_id: comunidadId,
      autor_id:     robleId,
      titulo:       titulo || null,
      contenido,
      created_at:   now,
      edited_at:    null,
      eliminado:    false,
    }], masterToken);
 
    const inserted = result?.inserted?.[0] || result?.[0] || {};
    return { id: inserted._id, contenido: inserted.contenido, created_at: inserted.created_at };
  }
}