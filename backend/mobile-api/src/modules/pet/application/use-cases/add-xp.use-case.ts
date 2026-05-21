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

  async execute(usuarioId: string, action: string, nivel?: number, subnivel?: number) {
    const masterToken = await this.systemAuth.getMasterToken();
    const pet = await this.petProvider.getPet(usuarioId, masterToken);

    const xpToAdd = XP_PER_ACTION[action];
    if (!xpToAdd) {
      throw new Error(`Acción desconocida: ${action}`);
    }

    const lastActions = pet?.last_actions ?? {};
    const todayUTC5 = this.getTodayUTC5();
    const actionKey = this.getActionKey(action, nivel, subnivel);

    if (lastActions[actionKey] === todayUTC5) {
      this.logger.log(`⚠️ XP de ${actionKey} ya otorgado hoy`);
      return {
        xp: pet?.xp ?? 0,
        xp_gained: 0,
        level: calculateLevel(pet?.xp ?? 0),
        form: calculateForm(pet?.xp ?? 0),
        selected_form: pet?.selected_form ?? 'seed',
        unlocked_forms: pet?.unlocked_forms ?? ['seed'],
        new_unlocks: [],
        evolved: false,
        already_given: true,
      };
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

    let selectedForm = currentSelectedForm;
    if (newlyUnlocked.length > 0 && !FLOWER_FORMS.includes(currentSelectedForm)) {
      selectedForm = newForm;
    }

    const updatedActions = {
      ...lastActions,
      [actionKey]: todayUTC5,
    };

    await this.petProvider.upsertPet({
      usuario_id: usuarioId,
      xp: newXp,
      selected_form: selectedForm,
      unlocked_forms: newUnlocked,
      last_actions: updatedActions,
    }, masterToken);

    this.logger.log(`✅ XP sumado: ${previousXp} + ${xpToAdd} = ${newXp} (${actionKey})`);

    return {
      xp: newXp,
      xp_gained: xpToAdd,
      level: newLevel,
      form: newForm,
      selected_form: selectedForm,
      unlocked_forms: newUnlocked,
      new_unlocks: newlyUnlocked,
      evolved,
      already_given: false,
    };
  }

  private getActionKey(action: string, nivel?: number, subnivel?: number): string {
    if (action === 'module_complete' && nivel !== undefined && subnivel !== undefined) {
      return `module_${nivel}_${subnivel}`;
    }
    return action;
  }

  private getTodayUTC5(): string {
    const ahora = new Date();
    const fechaUTC5 = new Date(ahora.getTime() - (5 * 60 * 60 * 1000));
    return fechaUTC5.toISOString().split('T')[0];
  }
}