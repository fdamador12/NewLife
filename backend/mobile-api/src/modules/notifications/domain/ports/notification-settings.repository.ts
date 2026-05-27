import { NotificationSettingsEntity } from '../entities/notification-settings.entity';

// Puerto (interfaz) que define cómo interactuar con el repositorio.
// Los métodos reciben el token como parámetro (patrón usado en el resto del proyecto).
export interface INotificationSettingsRepository {
  findByUsuarioId(usuarioId: string, token: string): Promise<NotificationSettingsEntity | null>;
  create(
    data: Omit<NotificationSettingsEntity, 'created_at' | 'updated_at'>,
    token: string,
  ): Promise<NotificationSettingsEntity>;
  update(
    usuarioId: string,
    data: Partial<NotificationSettingsEntity>,
    token: string,
  ): Promise<NotificationSettingsEntity>;
}