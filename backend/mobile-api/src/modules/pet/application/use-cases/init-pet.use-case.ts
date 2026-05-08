import { Inject, Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { IPetProviderPort } from '../../domain/ports/pet-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { INITIAL_FORM, INITIAL_UNLOCKED } from '../../domain/config/xp-config';

@Injectable()
export class InitPetUseCase {
  private logger = new Logger(InitPetUseCase.name);

  constructor(
    @Inject('IPetProviderPort')
    private readonly petProvider: IPetProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  @OnEvent('user.registered')
  async handleUserRegistered(payload: { uid: string }) {
    await this.execute(payload.uid);
  }

  async execute(usuarioId: string): Promise<void> {
    try {
      const masterToken = await this.systemAuth.getMasterToken();
      const existing = await this.petProvider.getPet(usuarioId, masterToken);

      if (existing) {
        this.logger.log(`⚠️ Pet ya existe para usuario ${usuarioId}`);
        return;
      }

      await this.petProvider.upsertPet({
        usuario_id: usuarioId,
        xp: 0,
        selected_form: INITIAL_FORM,
        unlocked_forms: INITIAL_UNLOCKED,
      }, masterToken);

      this.logger.log(`✅ Pet inicializada para usuario ${usuarioId}`);
    } catch (error) {
      this.logger.error('❌ Error en InitPetUseCase:', error);
      throw error;
    }
  }
}