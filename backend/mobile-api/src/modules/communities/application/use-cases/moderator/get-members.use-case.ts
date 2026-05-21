import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../../helpers/resolve-user-id.helper';
 
@Injectable()
export class ModGetMembersUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}
 
  async execute(comunidadId: string, moderadorUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const moderadorRobleId = await this.resolveUserId.getRobleId(moderadorUuid);
    await this.checkModerador(comunidadId, moderadorRobleId, masterToken);
 
    const membRes = await this.dbService.find('comunidad_usuarios', { comunidad_id: comunidadId }, masterToken);
    const members = Array.isArray(membRes) ? membRes : (membRes.rows || []);
 
    const enriched = await Promise.all(
      members.map(async (m: any) => {
        const user = await this.dbService.findById('usuarios', m.usuario_id, masterToken);
        return {
          id:           m._id,
          usuario_id:   m.usuario_id,
          nombre:       user?.nombre || 'Usuario',
          email:        user?.email || '',
          estado:       user?.estado || 'ACTIVO',
          tipo_acceso:  m.tipo_acceso,
          es_moderador: m.es_moderador,
          joined_at:    m.joined_at,
        };
      })
    );
 
    return enriched;
  }
 
  async checkModerador(comunidadId: string, robleId: string, masterToken: string) {
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const rows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = rows[0];
    if (!membresia || !membresia.es_moderador) {
      throw new ForbiddenException('No eres moderador de esta comunidad.');
    }
    return membresia;
  }
}