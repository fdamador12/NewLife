import React, { createContext, useContext, useState } from 'react';

type ProgressTabContextType = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
};

const ProgressTabContext = createContext<ProgressTabContextType | undefined>(undefined);

export function ProgressTabProvider({ children }: { children: React.ReactNode }) {
  const [activeTab, setActiveTab] = useState('Progress');

  return (
    <ProgressTabContext.Provider value={{ activeTab, setActiveTab }}>
      {children}
    </ProgressTabContext.Provider>
  );
}

export function useProgressTab() {
  const context = useContext(ProgressTabContext);
  if (!context) {
    throw new Error('useProgressTab must be used within ProgressTabProvider');
  }
  return context;
}
