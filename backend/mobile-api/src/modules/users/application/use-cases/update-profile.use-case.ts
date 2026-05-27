import { Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

export interface UpdateProfileDto {
  apodo?: string;
  pronombre?: string;
  motivo_sobrio?: string;
  gasto_semanal?: number;
  descripcion?: string;
}

/**
 * Caso de uso de actualizacion de perfil.
 *
 * IMPORTANTE: el "perfil" de un usuario esta dividido en 2 tablas:
 *
 * 1. `informacion_personal` (onboarding) → apodo, pronombre, motivo_sobrio, gasto_semanal
 * 2. `usuarios` (cuenta) → nombre, email, descripcion, avatar_url
 *
 * Este use-case decide a QUE tabla(s) ir segun los campos enviados:
 * - Si vienen apodo/pronombre/motivo_sobrio/gasto_semanal → tabla informacion_personal
 * - Si viene descripcion → tabla usuarios
 *
 * Si vienen ambos tipos, se hacen 2 updates en paralelo (uno por tabla).
 */
@Injectable()
export class UpdateProfileUseCase {
  constructor(
    private readonly dbService: DatabaseService,
    private readonly systemAuth: SystemAuthService,
  ) { }

  async execute(userId: string, updates: UpdateProfileDto) {
    const masterToken = await this.systemAuth.getMasterToken();

    // Separar campos por tabla
    const informacionPersonalFields: Record<string, any> = {};
    if (updates.apodo !== undefined) informacionPersonalFields.apodo = updates.apodo;
    if (updates.pronombre !== undefined) informacionPersonalFields.pronombre = updates.pronombre;
    if (updates.motivo_sobrio !== undefined) informacionPersonalFields.motivo_sobrio = updates.motivo_sobrio;
    if (updates.gasto_semanal !== undefined) informacionPersonalFields.gasto_semanal = Number(updates.gasto_semanal);

    const usuariosFields: Record<string, any> = {};
    if (updates.descripcion !== undefined) usuariosFields.descripcion = updates.descripcion;

    const hasInformacionPersonal = Object.keys(informacionPersonalFields).length > 0;
    const hasUsuarios = Object.keys(usuariosFields).length > 0;

    if (!hasInformacionPersonal && !hasUsuarios) {
      return { message: 'No hay campos para actualizar.' };
    }

    const updatePromises: Promise<any>[] = [];

    if (hasInformacionPersonal) {
      updatePromises.push(
        this.updateInformacionPersonal(userId, informacionPersonalFields, masterToken),
      );
    }

    if (hasUsuarios) {
      updatePromises.push(
        this.updateUsuarios(userId, usuariosFields, masterToken),
      );
    }

    await Promise.all(updatePromises);

    return { message: 'Perfil actualizado exitosamente.' };
  }

  /**
   * Actualiza campos en la tabla `informacion_personal`.
   */
  private async updateInformacionPersonal(
    userId: string,
    fields: Record<string, any>,
    masterToken: string,
  ): Promise<void> {
    const res = await this.dbService.find('informacion_personal', { usuario_id: userId }, masterToken);
    const rows = Array.isArray(res) ? res : (res.rows || []);

    if (rows.length === 0) {
      throw new NotFoundException('Perfil no encontrado. Completa el onboarding primero.');
    }

    const record = rows[0];

    await this.dbService.update(
      'informacion_personal',
      '_id',
      record._id,
      fields,
      masterToken,
    );
  }

  /**
   * Actualiza campos en la tabla `usuarios` (descripcion).
   */
  private async updateUsuarios(
    userId: string,
    fields: Record<string, any>,
    masterToken: string,
  ): Promise<void> {
    const res = await this.dbService.find('usuarios', { usuario_id: userId }, masterToken);
    const rows = Array.isArray(res) ? res : (res.rows || []);

    if (rows.length === 0) {
      throw new NotFoundException('Usuario no encontrado.');
    }

    const record = rows[0];

    await this.dbService.update(
      'usuarios',
      '_id',
      record._id,
      fields,
      masterToken,
    );
  }
}