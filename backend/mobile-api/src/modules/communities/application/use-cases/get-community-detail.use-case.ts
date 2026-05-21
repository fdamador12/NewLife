import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetCommunityDetailUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(comunidadId: string, usuarioId: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    // 1. Verificar que la comunidad existe y está activa
    const commRes = await this.dbService.find(
      'comunidades',
      { _id: comunidadId },
      masterToken,
    );
    const commRows = Array.isArray(commRes) ? commRes : (commRes.rows || []);
    const community = commRows[0];

    if (!community) throw new NotFoundException('Comunidad no encontrada.');
    if (!community.activa) throw new NotFoundException('Esta comunidad no está disponible.');

    // 2. Verificar que el usuario es miembro
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: usuarioId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = membRows[0];

    if (!membresia) {
      throw new ForbiddenException('No eres miembro de esta comunidad.');
    }

    // 3. Contar miembros
    const allMembRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId },
      masterToken,
    );
    const allMembers = Array.isArray(allMembRes) ? allMembRes : (allMembRes.rows || []);

    return {
      id:            community._id,
      nombre:        community.nombre,
      descripcion:   community.descripcion,
      activa:        community.activa,
      created_at:    community.created_at,
      total_miembros: allMembers.length,
      mi_acceso: {
        tipo_acceso:  membresia.tipo_acceso,
        es_moderador: membresia.es_moderador,
        joined_at:    membresia.joined_at,
      },
    };
  }
}