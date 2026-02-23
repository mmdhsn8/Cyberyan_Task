import React, { createContext, useContext, useMemo } from 'react';
import { AppTheme, appTheme } from './tokens';

const ThemeContext = createContext<AppTheme | undefined>(undefined);

export const ThemeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const value = useMemo<AppTheme>(() => appTheme, []);

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useAppTheme = (): AppTheme => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error('useAppTheme must be used inside ThemeProvider');
  }

  return context;
};
