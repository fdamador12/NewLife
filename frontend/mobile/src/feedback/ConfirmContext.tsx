import React, { createContext, useContext, useState, useCallback } from 'react';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ConfirmContextType {
  showConfirm: (options: ConfirmOptions) => void;
  hideConfirm: () => void;
  options: ConfirmOptions | null;
  visible: boolean;
}

const ConfirmContext = createContext<ConfirmContextType>({} as ConfirmContextType);

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const showConfirm = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setVisible(true);
  }, []);

  const hideConfirm = useCallback(() => {
    setVisible(false);
    setTimeout(() => setOptions(null), 300);
  }, []);

  return (
    <ConfirmContext.Provider value={{ showConfirm, hideConfirm, options, visible }}>
      {children}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}