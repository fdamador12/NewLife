import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { ResolveUserIdHelper } from '../helpers/resolve-user-id.helper';

@Injectable()
export class GetCommunityDetailUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
  ) { }

  async execute(comunidadId: string, usuarioUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const robleId = await this.resolveUserId.getRobleId(usuarioUuid);

    const community = await this.dbService.findById('comunidades', comunidadId, masterToken);

    if (!community) throw new NotFoundException('Comunidad no encontrada.');
    if (!community.activa) throw new NotFoundException('Esta comunidad no está disponible.');

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: robleId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];

    if (!membresia) throw new ForbiddenException('No eres miembro de esta comunidad.');

    const allMembRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId },
      masterToken,
    );
    const allMembers = Array.isArray(allMembRes) ? allMembRes : (allMembRes.rows || []);
    return {
      id: community._id,
      nombre: community.nombre,
      descripcion: community.descripcion,
      activa: community.activa,
      created_at: community.created_at,
      total_miembros: allMembers.length,
      mi_acceso: {
        tipo_acceso: membresia.tipo_acceso,
        es_moderador: membresia.es_moderador,
        joined_at: membresia.joined_at,
      },
    };
  }
}