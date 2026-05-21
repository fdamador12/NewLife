import { Injectable, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class ModGetMembersUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(comunidadId: string, moderadorId: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    await this.checkModerador(comunidadId, moderadorId, masterToken);

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId },
      masterToken,
    );
    const members = Array.isArray(membRes) ? membRes : (membRes.rows || []);

    const enriched = await Promise.all(
      members.map(async (m: any) => {
        const userRes = await this.dbService.find('usuarios', { _id: m.usuario_id }, masterToken);
        const user = Array.isArray(userRes) ? userRes[0] : userRes.rows?.[0];
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

  async checkModerador(comunidadId: string, usuarioId: string, masterToken: string) {
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: usuarioId },
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