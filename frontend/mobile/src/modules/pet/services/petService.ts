import api from '../../../services/api';
import { PetState, AddXpResponse, XpAction, PetForm } from '../types/pet.types';
import {
  isGuestMode,
  getGuestPet,
  saveGuestPet,
} from '../../../services/guestService';
import {
  XP_PER_ACTION,
  calculateForm,
  calculateUnlocked,
  calculateLevel,
} from '../config/xp-config';

const DEFAULT_PET: PetState = {
  xp: 0,
  level: 1,
  form: 'seed',
  selected_form: 'seed',
  unlocked_forms: ['seed'],
};

export const petService = {
  getPet: async (): Promise<PetState> => {
    const guest = await isGuestMode();

    if (guest) {
      const saved = await getGuestPet();
      return saved ?? DEFAULT_PET;
    }

    const response = await api.get('/pet');
    return response.data;
  },

  addXp: async (action: XpAction, nivel?: number, subnivel?: number): Promise<AddXpResponse> => {
    const guest = await isGuestMode();

    if (guest) {
      const current = await getGuestPet() ?? { ...DEFAULT_PET, last_actions: {} };
      const xpToAdd = XP_PER_ACTION[action] ?? 0;

      // ✅ Validar acción por día — igual que el backend
      const todayUTC5 = new Date(Date.now() - 5 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

      const lastActions = current.last_actions ?? {};

      // Para module_complete la clave es única por nivel+subnivel
      const actionKey =
        action === 'module_complete' && nivel !== undefined && subnivel !== undefined
          ? `module_${nivel}_${subnivel}`
          : action;

      if (lastActions[actionKey] === todayUTC5) {
        return {
          xp: current.xp,
          xp_gained: 0,
          level: calculateLevel(current.xp),
          form: calculateForm(current.xp) as PetForm,
          selected_form: current.selected_form,
          unlocked_forms: current.unlocked_forms,
          new_unlocks: [],
          evolved: false,
          already_given: true,
        };
      }

      const previousForm = calculateForm(current.xp);
      const previousUnlocked = current.unlocked_forms ?? ['seed'];

      const newXp = current.xp + xpToAdd;
      const newForm = calculateForm(newXp) as PetForm;
      const newUnlocked = calculateUnlocked(newXp) as PetForm[];
      const newLevel = calculateLevel(newXp);
      const newlyUnlocked = newUnlocked.filter(f => !previousUnlocked.includes(f));
      const evolved = newForm !== previousForm;

      // ✅ Si evolucionó y no tiene forma flower seleccionada → actualizar selected_form
      const FLOWER_FORMS = [
        'flower_lavanda', 'flower_azucena', 'flower_baobab',
        'flower_lirio', 'flower_crisantemo',
      ];
      let selectedForm = current.selected_form;
      if (newlyUnlocked.length > 0 && !FLOWER_FORMS.includes(current.selected_form)) {
        selectedForm = newForm;
      }

      const updatedPet = {
        ...current,
        xp: newXp,
        level: newLevel,
        form: newForm,
        selected_form: selectedForm,
        unlocked_forms: newUnlocked,
        last_actions: { ...lastActions, [actionKey]: todayUTC5 },
      };

      await saveGuestPet(updatedPet);

      return {
        xp: newXp,
        xp_gained: xpToAdd,
        level: newLevel,
        form: newForm,
        selected_form: selectedForm as PetForm,
        unlocked_forms: newUnlocked,
        new_unlocks: newlyUnlocked,
        evolved,
        already_given: false,
      };
    }

    // ✅ Usuario normal — llamada al backend
    const response = await api.post('/pet/add-xp', { action, nivel, subnivel });
    return response.data;
  },

  selectForm: async (form: string): Promise<PetState> => {
    const guest = await isGuestMode();

    if (guest) {
      const current = await getGuestPet() ?? { ...DEFAULT_PET, last_actions: {} };
      const updated = { ...current, selected_form: form as PetForm };
      await saveGuestPet(updated);
      return updated;
    }

    const response = await api.patch('/pet/select-form', { form });
    return response.data;
  },
};