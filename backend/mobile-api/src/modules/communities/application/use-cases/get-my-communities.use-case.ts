import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetMyCommunitiesUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    // 1. Buscar membresías del usuario
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { usuario_id: usuarioId },
      masterToken,
    );
    const membresias = Array.isArray(membRes) ? membRes : (membRes.rows || []);

    if (membresias.length === 0) return [];

    // 2. Para cada membresía buscar la comunidad
    const communities = await Promise.all(
      membresias.map(async (m: any) => {
        const commRes = await this.dbService.find(
          'comunidades',
          { _id: m.comunidad_id },
          masterToken,
        );
        const rows = Array.isArray(commRes) ? commRes : (commRes.rows || []);
        const community = rows[0];
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

    // Filtrar comunidades inactivas o no encontradas
    return communities.filter(Boolean);
  }
}