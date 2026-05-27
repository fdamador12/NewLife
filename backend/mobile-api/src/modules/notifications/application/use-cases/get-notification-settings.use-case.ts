import { Injectable, Inject } from '@nestjs/common';
import { INotificationSettingsRepository } from '../../domain/ports/notification-settings.repository';
import { NotificationSettingsEntity } from '../../domain/entities/notification-settings.entity';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';

@Injectable()
export class GetNotificationSettingsUseCase {
  constructor(
    @Inject('INotificationSettingsRepository')
    private readonly repo: INotificationSettingsRepository,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string): Promise<NotificationSettingsEntity | null> {
    // Obtener master token (cacheado por 14 min)
    const token = await this.systemAuth.getMasterToken();
    return this.repo.findByUsuarioId(usuarioId, token);
  }
}