import React, { createContext, useContext, useState } from 'react';
import { saveGuestProfile, isGuestMode } from '../services/guestService';

type OnboardingData = {
  apodo?: string;
  pronombre?: string;
  ult_fecha_consumo?: string;
  motivo_sobrio?: string;
  gasto_semana?: number;
  telefono?: number;
  reg_lugar_riesgo?: boolean;
  comp_logros_comunid?: boolean;
  moment_motiv?: string;
  nombre_contacto?: string;
  // Preferencia de notificaciones elegida en Step9b
  wants_notifications?: boolean;
};

type OnboardingContextType = {
  data: OnboardingData;
  setField: (key: keyof OnboardingData, value: any) => void;
  saveOnboarding: () => Promise<void>;
};

const OnboardingContext = createContext<OnboardingContextType>({} as OnboardingContextType);

export function OnboardingProvider({ children }: any) {
  const [data, setData] = useState<OnboardingData>({});

  const setField = (key: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [key]: value }));
  };

  // Llámalo en el Step10 al finalizar en lugar de completeProfile directo
  const saveOnboarding = async () => {
    const guest = await isGuestMode();
    if (guest) {
      await saveGuestProfile(data);
    }
    // Si no es invitado, el Step10 llama a completeProfile normalmente
  };

  return (
    <OnboardingContext.Provider value={{ data, setField, saveOnboarding }}>
      {children}
    </OnboardingContext.Provider>
  );
}

export const useOnboarding = () => useContext(OnboardingContext);