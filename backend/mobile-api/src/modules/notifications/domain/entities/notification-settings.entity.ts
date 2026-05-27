// Entidad que representa la configuración de notificaciones del usuario
export class NotificationSettingsEntity {
  _id: string;
  usuario_id: string;
  push_notifications_enabled: boolean;
  preferred_reminder_hour: number | null;
  preferred_reminder_minute: number | null;
  push_token: string | null;
  created_at: string;
  updated_at: string;

  constructor(data: {
    _id: string;
    usuario_id: string;
    push_notifications_enabled: boolean;
    preferred_reminder_hour?: number | null;
    preferred_reminder_minute?: number | null;
    push_token?: string | null;
    created_at: string;
    updated_at: string;
  }) {
    this._id = data._id;
    this.usuario_id = data.usuario_id;
    this.push_notifications_enabled = data.push_notifications_enabled;
    this.preferred_reminder_hour = data.preferred_reminder_hour ?? null;
    this.preferred_reminder_minute = data.preferred_reminder_minute ?? null;
    this.push_token = data.push_token ?? null;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }
}