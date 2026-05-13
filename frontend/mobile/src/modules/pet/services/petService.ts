import api from '../../../services/api';
import { cacheService } from '../../../services/cacheService';
import { CACHE_KEYS } from '../../../services/cacheKeys';
import { PetState, AddXpResponse, XpAction } from '../types/pet.types';

export const petService = {
  getPet: async (): Promise<PetState> => {
    return cacheService.withCache(
      CACHE_KEYS.PET,
      5,
      async () => {
        const response = await api.get('/pet');
        return response.data;
      },
    );
  },

  addXp: async (action: XpAction, nivel?: number, subnivel?: number): Promise<AddXpResponse> => {
    const response = await api.post('/pet/add-xp', { action, nivel, subnivel });
    return response.data;
  },

  selectForm: async (form: string): Promise<PetState> => {
    const response = await api.patch('/pet/select-form', { form });
    return response.data;
  },
};