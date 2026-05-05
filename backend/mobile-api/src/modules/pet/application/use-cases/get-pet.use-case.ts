import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPetProviderPort } from '../../domain/ports/pet-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { calculateForm, calculateLevel, calculateUnlocked, INITIAL_FORM, INITIAL_UNLOCKED } from '../../domain/config/xp-config';

@Injectable()
export class GetPetUseCase {
  private logger = new Logger(GetPetUseCase.name);

  constructor(
    @Inject('IPetProviderPort')
    private readonly petProvider: IPetProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    let pet = await this.petProvider.getPet(usuarioId, masterToken);

    if (!pet) {
      this.logger.log(`🌱 Creando pet inicial para usuario existente: ${usuarioId}`);
      await this.petProvider.upsertPet({
        usuario_id: usuarioId,
        xp: 0,
        selected_form: INITIAL_FORM,
        unlocked_forms: INITIAL_UNLOCKED,
        last_actions: {},
      }, masterToken);

      pet = await this.petProvider.getPet(usuarioId, masterToken);
    }

    if (!pet) {
      return {
        xp: 0,
        level: 1,
        form: INITIAL_FORM,
        selected_form: INITIAL_FORM,
        unlocked_forms: INITIAL_UNLOCKED,
      };
    }

    return {
      xp: pet.xp,
      level: calculateLevel(pet.xp),
      form: calculateForm(pet.xp),
      selected_form: pet.selected_form,
      unlocked_forms: pet.unlocked_forms,
    };
  }
}