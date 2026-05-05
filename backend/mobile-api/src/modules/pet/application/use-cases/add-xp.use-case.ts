import { Inject, Injectable, Logger } from '@nestjs/common';
import { IPetProviderPort } from '../../domain/ports/pet-provider.port';
import { SystemAuthService } from '../../../auth/infrastructure/services/system-auth.service';
import {
  XP_PER_ACTION,
  calculateForm,
  calculateLevel,
  calculateUnlocked,
} from '../../domain/config/xp-config';

const FLOWER_FORMS = [
  'flower_lavanda',
  'flower_azucena',
  'flower_baobab',
  'flower_lirio',
  'flower_crisantemo',
];

@Injectable()
export class AddXpUseCase {
  private logger = new Logger(AddXpUseCase.name);

  constructor(
    @Inject('IPetProviderPort')
    private readonly petProvider: IPetProviderPort,
    private readonly systemAuth: SystemAuthService,
  ) {}

  async execute(usuarioId: string, action: string) {
    const masterToken = await this.systemAuth.getMasterToken();
    const pet = await this.petProvider.getPet(usuarioId, masterToken);

    const xpToAdd = XP_PER_ACTION[action];
    if (!xpToAdd) {
      throw new Error(`Acción desconocida: ${action}`);
    }

    const previousXp = pet?.xp ?? 0;
    const previousForm = calculateForm(previousXp);
    const previousUnlocked = pet?.unlocked_forms ?? ['seed'];
    const currentSelectedForm = pet?.selected_form ?? 'seed';

    const newXp = previousXp + xpToAdd;
    const newForm = calculateForm(newXp);
    const newUnlocked = calculateUnlocked(newXp);
    const newLevel = calculateLevel(newXp);

    const newlyUnlocked = newUnlocked.filter(f => !previousUnlocked.includes(f));
    const evolved = newForm !== previousForm;

    // Auto-equipar si hay nueva forma desbloqueada
    // Solo auto-equipa si la forma actual NO es una flor
    // Si ya tiene una flor equipada, respetamos su elección
    let selectedForm = currentSelectedForm;
    if (newlyUnlocked.length > 0 && !FLOWER_FORMS.includes(currentSelectedForm)) {
      selectedForm = newForm;
    }

    await this.petProvider.upsertPet({
      usuario_id: usuarioId,
      xp: newXp,
      selected_form: selectedForm,
      unlocked_forms: newUnlocked,
    }, masterToken);

    this.logger.log(`✅ XP sumado: ${previousXp} + ${xpToAdd} = ${newXp} (${action})`);

    return {
      xp: newXp,
      xp_gained: xpToAdd,
      level: newLevel,
      form: newForm,
      selected_form: selectedForm,
      unlocked_forms: newUnlocked,
      new_unlocks: newlyUnlocked,
      evolved,
    };
  }
}