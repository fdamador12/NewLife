import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../../auth/infrastructure/services/system-auth.service';
import { ModGetMembersUseCase } from './get-members.use-case';

@Injectable()
export class ModSuspendMemberUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly modGetMembers: ModGetMembersUseCase,
  ) {}

  async execute(comunidadId: string, targetId: string, moderadorId: string, dias: number) {
    const masterToken = await this.systemAuth.getMasterToken();

    if (!dias || dias <= 0) {
      throw new BadRequestException('Debes indicar un número de días válido.');
    }

    await this.modGetMembers.checkModerador(comunidadId, moderadorId, masterToken);

    // Buscar usuario en tabla usuarios
    const userRes = await this.dbService.find('usuarios', { _id: targetId }, masterToken);
    const userRows = Array.isArray(userRes) ? userRes : (userRes.rows || []);
    const user = userRows[0];

    if (!user) throw new NotFoundException('Usuario no encontrado.');
    if (user.estado === 'BANEADO') {
      throw new ForbiddenException('El usuario ya está baneado.');
    }

    const suspension_hasta = new Date();
    suspension_hasta.setDate(suspension_hasta.getDate() + dias);

    await this.dbService.update(
      'usuarios', '_id', targetId,
      { estado: 'SUSPENDIDO', suspension_hasta: suspension_hasta.toISOString() },
      masterToken,
    );

    return {
      message: `Usuario suspendido por ${dias} días.`,
      suspension_hasta: suspension_hasta.toISOString(),
    };
  }
}