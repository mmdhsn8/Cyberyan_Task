import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { IdentityProvider } from '../../context/IdentityContext';
import { ThemeProvider } from '../../theme/ThemeProvider';

export const AppProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <AuthProvider>
      <IdentityProvider>
        <ThemeProvider>{children}</ThemeProvider>
      </IdentityProvider>
    </AuthProvider>
  );
};
