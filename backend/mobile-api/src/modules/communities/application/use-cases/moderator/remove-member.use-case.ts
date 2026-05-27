import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../../auth/infrastructure/services/system-auth.service';
import { ModGetMembersUseCase } from './get-members.use-case';
import { ResolveUserIdHelper } from '../../helpers/resolve-user-id.helper';

@Injectable()
export class ModRemoveMemberUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
    private readonly modGetMembers: ModGetMembersUseCase,
  ) {}
 
  async execute(comunidadId: string, targetId: string, moderadorUuid: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const moderadorRobleId = await this.resolveUserId.getRobleId(moderadorUuid);
 
    await this.modGetMembers.checkModerador(comunidadId, moderadorRobleId, masterToken);
 
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: targetId },
      masterToken,
    );
    const rows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = rows[0];
 
    if (!membresia) throw new NotFoundException('El usuario no es miembro de esta comunidad.');
    if (targetId === moderadorRobleId) throw new ForbiddenException('No puedes expulsarte a ti mismo.');
 
    await this.dbService.delete('comunidad_usuarios', '_id', membresia._id, masterToken);
 
    if (membresia.es_moderador) {
      const otrasRes = await this.dbService.find('comunidad_usuarios', { usuario_id: targetId }, masterToken);
      const otras = Array.isArray(otrasRes) ? otrasRes : (otrasRes.rows || []);
      const esModeEnOtra = otras.some((m: any) => m.es_moderador && m.comunidad_id !== comunidadId);
 
      if (!esModeEnOtra) {
        await this.dbService.update('usuarios', '_id', targetId, { rol: 'USUARIO' }, masterToken);
      }
    }
 
    return { message: 'Miembro expulsado de la comunidad.' };
  }
}