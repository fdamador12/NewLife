import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class GetDailyForumUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    // Comunidades del usuario
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { usuario_id: robleId },
      masterToken,
    );
    const membresias = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membresias.length === 0) return { foro: null, comunidades: [] };

    // Foro del día de hoy
    const today = new Date().toISOString().split('T')[0];
    const foroRes = await this.dbService.find('foro_del_dia', { fecha: today }, masterToken);
    const foroRows = Array.isArray(foroRes) ? foroRes : (foroRes.rows || []);
    const foro = foroRows[0] || null;

    // Comunidades activas del usuario
    const comunidades = await Promise.all(
      membresias.map(async (m: any) => {
        const community = await this.dbService.findById('comunidades', m.comunidad_id, masterToken);
        if (!community || !community.activa) return null;
        return {
          id:           community._id,
          nombre:       community.nombre,
          tipo_acceso:  m.tipo_acceso,
          es_moderador: m.es_moderador,
        };
      })
    );

    return {
      foro: foro ? {
        id:          foro._id,
        pregunta:    foro.pregunta,
        descripcion: foro.descripcion,
        fecha:       foro.fecha,
        es_hoy:      true,
      } : null,
      comunidades: comunidades.filter(Boolean),
    };
  }
}