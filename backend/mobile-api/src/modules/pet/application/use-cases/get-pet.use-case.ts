import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPetProviderPort } from '../../domain/ports/pet-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import { calculateForm, calculateLevel, calculateUnlocked } from '../../domain/config/xp-config';

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
    const pet = await this.petProvider.getPet(usuarioId, masterToken);

    if (!pet) {
      return {
        xp: 0,
        level: 1,
        form: 'seed',
        selected_form: 'seed',
        unlocked_forms: ['seed'],
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