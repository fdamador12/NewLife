import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../../auth/infrastructure/services/system-auth.service';
import { ModGetMembersUseCase } from './get-members.use-case';

const VALID_ACCESS = ['SOLO_VER', 'POSTEAR_COMENTAR', 'CHAT_COMPLETO'];

@Injectable()
export class ModChangeAccessUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly modGetMembers: ModGetMembersUseCase,
  ) {}

  async execute(comunidadId: string, targetId: string, moderadorId: string, tipoAcceso: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    if (!VALID_ACCESS.includes(tipoAcceso)) {
      throw new ForbiddenException(`Tipo de acceso inválido. Opciones: ${VALID_ACCESS.join(', ')}`);
    }

    await this.modGetMembers.checkModerador(comunidadId, moderadorId, masterToken);

    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: targetId },
      masterToken,
    );
    const rows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    const membresia = rows[0];

    if (!membresia) throw new NotFoundException('El usuario no es miembro de esta comunidad.');

    await this.dbService.update(
      'comunidad_usuarios', '_id', membresia._id, { tipo_acceso: tipoAcceso }, masterToken,
    );

    return { message: 'Tipo de acceso actualizado.' };
  }
}