import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { petService } from '../services/petService';
import { PetState, AddXpResponse, XpAction, PetForm } from '../types/pet.types';
import { useToast } from '../../../feedback/ToastContext';
import { getPetMessage } from '../utils/petHelpers';

const DEFAULT_PET: PetState = {
  xp: 0,
  level: 1,
  form: 'seed',
  selected_form: 'seed',
  unlocked_forms: ['seed'],
};

interface PetContextType {
  pet: PetState;
  message: string;
  loading: boolean;
  error: string | null;
  fetchPet: () => Promise<void>;
  resetPet: () => void;
  addXp: (action: XpAction, nivel?: number, subnivel?: number) => Promise<AddXpResponse | null>;
  selectForm: (form: PetForm) => Promise<void>;
}

const PetContext = createContext<PetContextType>({} as PetContextType);

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pet, setPet] = useState<PetState>(DEFAULT_PET);
  const [message, setMessage] = useState<string>(() => getPetMessage('seed'));
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  const fetchPet = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await petService.getPet();
      setPet(data);
      setMessage(getPetMessage(data.selected_form));
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

  const resetPet = useCallback(() => {
    setPet(DEFAULT_PET);
    setMessage(getPetMessage('seed'));
    setError(null);
    setLoading(false);
  }, []);

  const addXp = useCallback(async (
    action: XpAction,
    nivel?: number,
    subnivel?: number,
  ): Promise<AddXpResponse | null> => {
    try {
      const response = await petService.addXp(action, nivel, subnivel);
      if (!response.already_given) {
        setPet({
          xp: response.xp,
          level: response.level,
          form: response.form,
          selected_form: response.selected_form,
          unlocked_forms: response.unlocked_forms,
        });
        setMessage(getPetMessage(response.selected_form));
      }
      return response;
    } catch (e) {
      console.log('Error sumando XP:', e);
      return null;
    }
  }, []);

  const selectForm = useCallback(async (form: PetForm) => {
    const previous = pet.selected_form;
    setPet(prev => ({ ...prev, selected_form: form }));
    setMessage(getPetMessage(form));
    try {
      await petService.selectForm(form);
    } catch (e: any) {
      console.log('Error seleccionando forma:', e);
      setPet(prev => ({ ...prev, selected_form: previous }));
      setMessage(getPetMessage(previous));
      if (!e.response) {
        showToast('Sin conexión. No se pudo cambiar la mascota.', 'error');
      } else {
        showToast('No se pudo cambiar la mascota. Intenta de nuevo.', 'error');
      }
    }
  }, [pet.selected_form, showToast]);

  return (
    <PetContext.Provider value={{ pet, message, loading, error, fetchPet, resetPet, addXp, selectForm }}>
      {children}
    </PetContext.Provider>
  );
}

export function usePetContext() {
  return useContext(PetContext);
}