import api from '../../../services/api';
import { PetState, AddXpResponse, XpAction } from '../types/pet.types';

export const petService = {
  getPet: async (): Promise<PetState> => {
    const response = await api.get('/pet');
    return response.data;
  },

  addXp: async (action: XpAction): Promise<AddXpResponse> => {
    const response = await api.post('/pet/add-xp', { action });
    return response.data;
  },

  selectForm: async (form: string): Promise<PetState> => {
    const response = await api.patch('/pet/select-form', { form });
    return response.data;
  },
};