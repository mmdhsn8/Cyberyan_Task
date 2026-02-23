import React, {
  createContext,
  useEffect,
  useMemo,
  useReducer,
  useState,
} from 'react';
import {
  IdentityAction,
  IdentityContextValue,
  IdentityState,
  VerifiableCredential,
} from '../types/identity.types';
import {
  getPersistedIdentityState,
  persistIdentityState,
} from '../services/storage/identity.storage';

const initialState: IdentityState = {
  did: null,
  vc: null,
  passportImageUri: null,
  selfieImageUri: null,
  auditTrail: [],
  issuanceSource: null,
  pendingAuthToken: null,
};

const identityReducer = (
  state: IdentityState,
  action: IdentityAction,
): IdentityState => {
  switch (action.type) {
    case 'BOOTSTRAP_IDENTITY':
      return action.payload;
    case 'SET_PASSPORT_IMAGE':
      return {
        ...state,
        passportImageUri: action.payload,
        did: null,
        vc: null,
        auditTrail: [],
        issuanceSource: null,
        pendingAuthToken: null,
      };
    case 'SET_SELFIE_IMAGE':
      return {
        ...state,
        selfieImageUri: action.payload,
        did: null,
        vc: null,
        auditTrail: [],
        issuanceSource: null,
        pendingAuthToken: null,
      };
    case 'SET_IDENTITY':
      return {
        ...state,
        did: action.payload.did,
        vc: action.payload.vc,
        auditTrail: action.payload.auditTrail,
        issuanceSource: action.payload.issuanceSource,
        pendingAuthToken: action.payload.pendingAuthToken,
      };
    case 'CLEAR_TRANSIENT_IDENTITY':
      return {
        ...state,
        passportImageUri: null,
        selfieImageUri: null,
        pendingAuthToken: null,
      };
    case 'RESET_IDENTITY':
      return initialState;
    default:
      return state;
  }
};

export const IdentityContext = createContext<IdentityContextValue | undefined>(
  undefined,
);

export const IdentityProvider: React.FC<React.PropsWithChildren> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(identityReducer, initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    let isActive = true;

    const bootstrap = async () => {
      const persistedState = await getPersistedIdentityState();

      if (!isActive) {
        return;
      }

      if (persistedState) {
        dispatch({
          type: 'BOOTSTRAP_IDENTITY',
          payload: {
            did: persistedState.did,
            vc: persistedState.vc,
            passportImageUri: persistedState.passportImageUri,
            selfieImageUri: persistedState.selfieImageUri,
            auditTrail: persistedState.auditTrail,
            issuanceSource: persistedState.issuanceSource ?? null,
            pendingAuthToken: persistedState.pendingAuthToken ?? null,
          },
        });
      }

      setIsHydrated(true);
    };

    bootstrap()
      .catch(() => {
        if (isActive) {
          setIsHydrated(true);
        }
      });

    return () => {
      isActive = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    persistIdentityState(state).catch(() => {
      // Keep app working even if encrypted persistence fails at runtime.
    });
  }, [isHydrated, state]);

  const setPassportImage = (uri: string | null) => {
    dispatch({ type: 'SET_PASSPORT_IMAGE', payload: uri });
  };

  const setSelfieImage = (uri: string | null) => {
    dispatch({ type: 'SET_SELFIE_IMAGE', payload: uri });
  };

  const setIdentityPayload = (payload: {
    did: string;
    vc: VerifiableCredential;
    auditTrail: IdentityState['auditTrail'];
    issuanceSource: NonNullable<IdentityState['issuanceSource']>;
    pendingAuthToken: string;
  }) => {
    dispatch({
      type: 'SET_IDENTITY',
      payload: {
        did: payload.did,
        vc: payload.vc,
        auditTrail: payload.auditTrail,
        issuanceSource: payload.issuanceSource,
        pendingAuthToken: payload.pendingAuthToken,
      },
    });
  };

  const resetIdentity = () => {
    dispatch({ type: 'RESET_IDENTITY' });
  };

  const clearTransientIdentityData = () => {
    dispatch({ type: 'CLEAR_TRANSIENT_IDENTITY' });
  };

  const value = useMemo<IdentityContextValue>(() => {
    return {
      state,
      setPassportImage,
      setSelfieImage,
      setIdentityPayload,
      clearTransientIdentityData,
      resetIdentity,
    };
  }, [state]);

  return (
    <IdentityContext.Provider value={value}>{children}</IdentityContext.Provider>
  );
};
