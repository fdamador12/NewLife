import { Injectable, ForbiddenException, NotFoundException, BadRequestException } from '@nestjs/common';
import { DatabaseService } from '../../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../../auth/infrastructure/services/system-auth.service';
import { ModGetMembersUseCase } from './get-members.use-case';

@Injectable()
export class ModRequestBanUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
    private readonly modGetMembers: ModGetMembersUseCase,
  ) {}

  async execute(comunidadId: string, targetId: string, moderadorId: string, motivo: string) {
    const masterToken = await this.systemAuth.getMasterToken();

    await this.modGetMembers.checkModerador(comunidadId, moderadorId, masterToken);

    // Verificar que el usuario es miembro
    const membRes = await this.dbService.find(
      'comunidad_usuarios',
      { comunidad_id: comunidadId, usuario_id: targetId },
      masterToken,
    );
    const membRows = Array.isArray(membRes) ? membRes : (membRes.rows || []);
    if (membRows.length === 0) {
      throw new NotFoundException('El usuario no es miembro de esta comunidad.');
    }

    // Verificar que no haya una solicitud pendiente ya
    const existingRes = await this.dbService.find(
      'solicitudes_baneo',
      { usuario_id: targetId, comunidad_id: comunidadId },
      masterToken,
    );
    const existing = Array.isArray(existingRes) ? existingRes : (existingRes.rows || []);
    const pendiente = existing.find((s: any) => s.estado === 'PENDIENTE');

    if (pendiente) {
      throw new BadRequestException('Ya existe una solicitud de baneo pendiente para este usuario.');
    }

    // Crear solicitud
    await this.dbService.insert('solicitudes_baneo', [{
      usuario_id:   targetId,
      moderador_id: moderadorId,
      comunidad_id: comunidadId,
      motivo,
      estado:       'PENDIENTE',
      created_at:   new Date().toISOString(),
    }], masterToken);

    return { message: 'Solicitud de baneo enviada al administrador.' };
  }
}