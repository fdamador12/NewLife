import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class GetMyCommunitiesUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { usuario_id: robleId },
      masterToken,
    );
    const membresias = Array.isArray(membRes) ? membRes : (membRes.rows || []);

    if (membresias.length === 0) return [];

    const communities = await Promise.all(
      membresias.map(async (m: any) => {
        const community = await this.dbService.findById('comunidades', m.comunidad_id, masterToken);
        if (!community || !community.activa) return null;

        return {
          id:           community._id,
          nombre:       community.nombre,
          descripcion:  community.descripcion,
          tipo_acceso:  m.tipo_acceso,
          es_moderador: m.es_moderador,
          joined_at:    m.joined_at,
        };
      })
    );

    return communities.filter(Boolean);
  }
}