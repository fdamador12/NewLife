import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { petService } from '../services/petService';
import { PetState, AddXpResponse, XpAction, PetForm } from '../types/pet.types';
import { useToast } from '../../../feedback/ToastContext';

const DEFAULT_PET: PetState = {
  xp: 0,
  level: 1,
  form: 'seed',
  selected_form: 'seed',
  unlocked_forms: ['seed'],
};

interface PetContextType {
  pet: PetState;
  loading: boolean;
  error: string | null;
  fetchPet: () => Promise<void>;
  addXp: (action: XpAction) => Promise<AddXpResponse | null>;
  selectForm: (form: PetForm) => Promise<void>;
}

const PetContext = createContext<PetContextType>({} as PetContextType);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pet, setPet] = useState<PetState>(DEFAULT_PET);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchPet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petService.getPet();
      setPet(data);
    } catch (e) {
      console.log('Error obteniendo pet:', e);
      setError('No se pudo cargar la mascota');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPet();
  }, [fetchPet]);

  const addXp = useCallback(async (action: XpAction): Promise<AddXpResponse | null> => {
    try {
      const response = await petService.addXp(action);
      setPet({
        xp: response.xp,
        level: response.level,
        form: response.form,
        selected_form: response.selected_form,
        unlocked_forms: response.unlocked_forms,
      });
      return response;
    } catch (e) {
      console.log('Error sumando XP:', e);
      return null;
    }
  }, []);

  const selectForm = useCallback(async (form: PetForm) => {
    const previous = pet.selected_form;
    setPet(prev => ({ ...prev, selected_form: form }));
    try {
      await petService.selectForm(form);
    } catch (e: any) {
      console.log('Error seleccionando forma:', e);
      setPet(prev => ({ ...prev, selected_form: previous }));
      if (!e.response) {
        showToast('Sin conexión. No se pudo cambiar la mascota.', 'error');
      } else {
        showToast('No se pudo cambiar la mascota. Intenta de nuevo.', 'error');
      }
    }
  }, [pet.selected_form, showToast]);

  return (
    <PetContext.Provider value={{ pet, loading, error, fetchPet, addXp, selectForm }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePetContext() {
  return useContext(PetContext);
}