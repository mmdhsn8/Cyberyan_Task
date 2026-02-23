import { useContext } from 'react';
import { IdentityContext } from '../context/IdentityContext';

export const useIdentity = () => {
  const context = useContext(IdentityContext);

  if (!context) {
    throw new Error('useIdentity must be used inside IdentityProvider');
  }

  return context;
};

