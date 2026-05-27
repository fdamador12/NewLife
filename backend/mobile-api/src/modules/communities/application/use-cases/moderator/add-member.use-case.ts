import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../../auth/infrastructure/services/system-auth.service';
import { ModGetMembersUseCase } from './get-members.use-case';
import { ResolveUserIdHelper } from '../../helpers/resolve-user-id.helper';

@Injectable()
export class ModAddMemberUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly resolveUserId: ResolveUserIdHelper,
    private readonly modGetMembers: ModGetMembersUseCase,
  ) {}
 
  async execute(comunidadId: string, moderadorUuid: string, email: string, tipoAcceso: string = 'POSTEAR_COMENTAR') {
    const masterToken = await this.systemAuth.getMasterToken();
    const moderadorRobleId = await this.resolveUserId.getRobleId(moderadorUuid);
 
    await this.modGetMembers.checkModerador(comunidadId, moderadorRobleId, masterToken);
 
    const userRes = await this.dbService.find('usuarios', { email }, masterToken);
    const userRows = Array.isArray(userRes) ? userRes : (userRes.rows || []);
    const user = userRows[0];
 
    if (!user) throw new NotFoundException(`No se encontró un usuario con el correo ${email}.`);
    if (['BANEADO', 'ELIMINADO', 'SUSPENDIDO'].includes(user.estado)) {
      throw new ForbiddenException(`No se puede agregar a un usuario ${user.estado.toLowerCase()}.`);
    }
 
    const existRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: user._id },
      masterToken,
    );
    const existRows = Array.isArray(existRes) ? existRes : (existRes.rows || []);
    if (existRows.length > 0) throw new BadRequestException('El usuario ya es miembro de esta comunidad.');
 
    await this.dbService.insert('comunidad_usuarios', [{
      comunidad_id: comunidadId,
      usuario_id:   user._id,
      tipo_acceso:  tipoAcceso,
      es_moderador: false,
      joined_at:    new Date().toISOString(),
    }], masterToken);
 
    return { message: `${user.nombre || email} agregado a la comunidad.` };
  }
}