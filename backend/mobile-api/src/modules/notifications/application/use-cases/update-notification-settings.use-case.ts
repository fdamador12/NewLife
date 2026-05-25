import { Injectable, Inject } from '@nestjs/common';
import { INotificationSettingsRepository } from '../../domain/ports/notification-settings.repository';
import { NotificationSettingsEntity } from '../../domain/entities/notification-settings.entity';
import { UpdateNotificationSettingsDto } from '../../presentation/dtos/update-notification-settings.dto';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class UpdateNotificationSettingsUseCase {
  constructor(
    @Inject('INotificationSettingsRepository')
    private readonly repo: INotificationSettingsRepository,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(
    usuarioId: string,
    input: UpdateNotificationSettingsDto,
  ): Promise<NotificationSettingsEntity> {
    // Obtener master token (cacheado por 14 min)
    const token = await this.systemAuth.getMasterToken();

    // Buscar si ya existe configuracion para el usuario
    let settings = await this.repo.findByUsuarioId(usuarioId, token);

    if (!settings) {
      // No existe -> crear con valores por defecto + lo que vino.
      // OJO: NO generamos _id, ROBLE lo crea automaticamente con 12 caracteres.
      settings = await this.repo.create(
        {
          _id: '', // ignorado por el adapter
          usuario_id: usuarioId,
          push_notifications_enabled: input.push_notifications_enabled ?? false,
          preferred_reminder_hour: input.preferred_reminder_hour ?? null,
          preferred_reminder_minute: input.preferred_reminder_minute ?? null,
          push_token: input.push_token ?? null,
        },
        token,
      );
    } else {
      // Ya existe -> actualizar solo los campos enviados
      settings = await this.repo.update(usuarioId, input, token);
    }

    return settings;
  }
}