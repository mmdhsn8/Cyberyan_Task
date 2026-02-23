import React, {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
} from 'react';
import {
  AuthAction,
  AuthContextValue,
  AuthResponse,
  AuthState,
  RegisterPayload,
  UserProfile,
} from '../types/auth.types';
import { clearToken, getToken, persistToken } from '../services/storage/token.storage';
import {
  clearPersistedProfile,
  getPersistedProfile,
  persistProfile,
} from '../services/storage/profile.storage';
import { clearPersistedIdentityState } from '../services/storage/identity.storage';

const initialState: AuthState = {
  user: null,
  token: null,
  isBootstrapping: true,
};

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'BOOTSTRAP_COMPLETE':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        isBootstrapping: false,
      };
    case 'SET_PROFILE':
      return {
        ...state,
        user: action.payload,
      };
    case 'SIGN_IN':
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
      };
    case 'CLEAR_PROFILE':
      return {
        ...state,
        user: null,
      };
    case 'SIGN_OUT':
      return {
        ...state,
        token: null,
        user: null,
      };
    default:
      return state;
  }
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    let isActive = true;
    let isCompleted = false;

    const completeBootstrap = (payload: {
      token: string | null;
      user: UserProfile | null;
    }) => {
      if (!isActive || isCompleted) {
        return;
      }

      isCompleted = true;
      dispatch({ type: 'BOOTSTRAP_COMPLETE', payload });
    };

    // Fail-safe: never keep splash blocked forever if storage is slow/unavailable.
    const timeoutId = setTimeout(() => {
      completeBootstrap({ token: null, user: null });
    }, 2500);

    const bootstrap = async () => {
      const [token, user] = await Promise.all([getToken(), getPersistedProfile()]);
      completeBootstrap({ token, user });
    };

    bootstrap().catch(() => {
      completeBootstrap({ token: null, user: null });
    });

    return () => {
      isActive = false;
      clearTimeout(timeoutId);
    };
  }, []);

  const setProfile = useCallback(
    async (payload: RegisterPayload) => {
      const profile: UserProfile = {
        id: state.user?.id ?? `draft-${Date.now()}`,
        name: payload.name,
        email: payload.email,
      };

      dispatch({
        type: 'SET_PROFILE',
        payload: profile,
      });

      try {
        await persistProfile(profile);
      } catch {
        // Keep in-memory profile even if encrypted persistence fails.
      }
    },
    [state.user?.id],
  );

  const signIn = useCallback(async (payload: AuthResponse) => {
    await Promise.allSettled([persistToken(payload.token), persistProfile(payload.user)]);
    dispatch({ type: 'SIGN_IN', payload });
  }, []);

  const clearProfileData = useCallback(async () => {
    dispatch({ type: 'CLEAR_PROFILE' });
    try {
      await clearPersistedProfile();
    } catch {
      // Keep app running even if local profile cleanup fails.
    }
  }, []);

  const signOut = useCallback(async () => {
    await Promise.allSettled([
      clearToken(),
      clearPersistedProfile(),
      clearPersistedIdentityState(),
    ]);
    dispatch({ type: 'SIGN_OUT' });
  }, []);

  const value = useMemo<AuthContextValue>(() => {
    return {
      state,
      setProfile,
      signIn,
      clearProfileData,
      signOut,
    };
  }, [clearProfileData, setProfile, signIn, signOut, state]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
