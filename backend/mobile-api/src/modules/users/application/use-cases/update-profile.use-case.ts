import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

export interface UpdateProfileDto {
  apodo?: string;
  pronombre?: string;
  motivo_sobrio?: string;
  gasto_semanal?: number;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(userId: string, updates: UpdateProfileDto) {
    const masterToken = await this.systemAuth.getMasterToken();

    // Verificar que existe el perfil
    const res = await this.dbService.find('informacion_personal', { usuario_id: userId }, masterToken);
    const rows = Array.isArray(res) ? res : (res.rows || []);

    if (rows.length === 0) {
      throw new NotFoundException('Perfil no encontrado. Completa el onboarding primero.');
    }

    const record = rows[0];
    const fieldsToUpdate: Record<string, any> = {};

    if (updates.apodo !== undefined)        fieldsToUpdate.apodo        = updates.apodo;
    if (updates.pronombre !== undefined)    fieldsToUpdate.pronombre    = updates.pronombre;
    if (updates.motivo_sobrio !== undefined) fieldsToUpdate.motivo_sobrio = updates.motivo_sobrio;
    if (updates.gasto_semanal !== undefined) fieldsToUpdate.gasto_semanal = Number(updates.gasto_semanal);

    if (Object.keys(fieldsToUpdate).length === 0) {
      return { message: 'No hay campos para actualizar.' };
    }

    await this.dbService.update(
      'informacion_personal',
      '_id',
      record._id,
      fieldsToUpdate,
      masterToken,
    );

    return { message: 'Perfil actualizado exitosamente.' };
  }
}