import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class GetAllForumsUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) {}

  async execute(usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    // Verificar que el usuario tiene al menos una comunidad
    const membRes = await this.dbService.find(
      'comunidad_usuarios', { usuario_id: robleId }, masterToken,
    );
    const membresias = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membresias.length === 0) return { foros: [], comunidades: [] };

    // Traer todos los foros del día
    const allForos = await this.dbService.findAll('foro_del_dia', masterToken);

    const today = new Date().toISOString().split('T')[0];

    const foros = allForos
      .filter((f: any) => f.fecha <= today)
      .map((f: any) => ({
        id:          f._id,
        pregunta:    f.pregunta,
        descripcion: f.descripcion,
        fecha:       f.fecha,
        created_at:  f.created_at,
        es_hoy:      f.fecha === today,
      }))
      .sort((a: any, b: any) => {
        // Hoy primero, luego por fecha descendente
        if (a.es_hoy && !b.es_hoy) return -1;
        if (!a.es_hoy && b.es_hoy) return 1;
        return new Date(b.fecha).getTime() - new Date(a.fecha).getTime();
      });

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
      foros,
      comunidades: comunidades.filter(Boolean),
    };
  }
}