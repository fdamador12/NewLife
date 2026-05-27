import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { DatabaseService } from '../../../database/infrastructure/database.service';
import { INotificationSettingsRepository } from '../../domain/ports/notification-settings.repository';
import { NotificationSettingsEntity } from '../../domain/entities/notification-settings.entity';

const TABLE_NAME = 'user_notification_settings';

@Injectable()
export class RobleNotificationSettingsAdapter implements INotificationSettingsRepository {
  private readonly logger = new Logger(RobleNotificationSettingsAdapter.name);

  constructor(private readonly db: DatabaseService) {}

  async findByUsuarioId(
    usuarioId: string,
    token: string,
  ): Promise<NotificationSettingsEntity | null> {
    try {
      const result = await this.db.find(
        TABLE_NAME,
        { usuario_id: usuarioId },
        token,
      );

      const rows = Array.isArray(result) ? result : (result?.rows ?? []);
      if (rows.length === 0) return null;

      return new NotificationSettingsEntity(rows[0]);
    } catch (error: any) {
      this.logger.error(
        `Error en findByUsuarioId(${usuarioId}):`,
        error?.message ?? error,
      );
      throw error;
    }
  }

  async create(
    data: Omit<NotificationSettingsEntity, '_id' | 'created_at' | 'updated_at'> & { _id?: string },
    token: string,
  ): Promise<NotificationSettingsEntity> {
    const now = new Date().toISOString();

    // IMPORTANTE: NO enviamos _id. ROBLE lo genera automaticamente con 12 chars.
    // Esta es la convencion usada en otros modulos del proyecto (ej: agenda).
    const payload = {
      usuario_id: data.usuario_id,
      push_notifications_enabled: data.push_notifications_enabled,
      preferred_reminder_hour: data.preferred_reminder_hour,
      preferred_reminder_minute: data.preferred_reminder_minute,
      push_token: data.push_token,
      created_at: now,
      updated_at: now,
    };

    try {
      const result = await this.db.insert(TABLE_NAME, [payload], token);

      // ROBLE devuelve { inserted: [...], skipped: [...] }.
      // Si skipped tiene entradas, el insert FALLO silenciosamente.
      if (!result || !result.inserted || result.inserted.length === 0) {
        this.logger.error(
          `Insert rechazado por ROBLE. Skipped:`,
          JSON.stringify(result?.skipped ?? 'sin info'),
        );
        throw new InternalServerErrorException(
          `No se pudo crear la configuracion de notificaciones: ${JSON.stringify(result?.skipped)}`,
        );
      }

      // ROBLE devuelve la fila completa, incluido el _id generado
      const created = result.inserted[0];
      return new NotificationSettingsEntity(created);
    } catch (error: any) {
      this.logger.error(
        `Error en create() para usuario ${data.usuario_id}:`,
        error?.message ?? error,
      );
      throw error;
    }
  }

  async update(
    usuarioId: string,
    data: Partial<NotificationSettingsEntity>,
    token: string,
  ): Promise<NotificationSettingsEntity> {
    const existing = await this.findByUsuarioId(usuarioId, token);
    if (!existing) {
      throw new Error(`No notification settings found for usuario_id: ${usuarioId}`);
    }

    // Solo actualizamos los campos que vienen en `data`.
    // Usamos `in data` para distinguir entre "no enviado" y "enviado como null".
    const updates: any = {
      updated_at: new Date().toISOString(),
    };

    if ('push_notifications_enabled' in data) {
      updates.push_notifications_enabled = data.push_notifications_enabled;
    }
    if ('preferred_reminder_hour' in data) {
      updates.preferred_reminder_hour = data.preferred_reminder_hour;
    }
    if ('preferred_reminder_minute' in data) {
      updates.preferred_reminder_minute = data.preferred_reminder_minute;
    }
    if ('push_token' in data) {
      updates.push_token = data.push_token;
    }

    try {
      // update con 5 parametros: tableName, idColumn, idValue, updates, token
      await this.db.update(TABLE_NAME, 'usuario_id', usuarioId, updates, token);

      // Volver a leer la fila actualizada para devolver datos frescos
      const refreshed = await this.findByUsuarioId(usuarioId, token);
      if (!refreshed) {
        throw new Error('No se pudo recuperar la configuracion despues de actualizar');
      }
      return refreshed;
    } catch (error: any) {
      this.logger.error(
        `Error en update() para usuario ${usuarioId}:`,
        error?.message ?? error,
      );
      throw error;
    }
  }
}