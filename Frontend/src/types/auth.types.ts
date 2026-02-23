export interface UserProfile {
  id: string;
  name: string;
  email: string;
}

export interface AuthState {
  user: UserProfile | null;
  token: string | null;
  isBootstrapping: boolean;
}

export type AuthAction =
  | {
      type: 'BOOTSTRAP_COMPLETE';
      payload: { token: string | null; user: UserProfile | null };
    }
  | { type: 'SET_PROFILE'; payload: UserProfile }
  | { type: 'SIGN_IN'; payload: { token: string; user: UserProfile } }
  | { type: 'CLEAR_PROFILE' }
  | { type: 'SIGN_OUT' };

export interface RegisterPayload {
  name: string;
  email: string;
}

export interface AuthResponse {
  token: string;
  user: UserProfile;
}

export interface AuthContextValue {
  state: AuthState;
  setProfile: (payload: RegisterPayload) => Promise<void>;
  signIn: (payload: AuthResponse) => Promise<void>;
  clearProfileData: () => Promise<void>;
  signOut: () => Promise<void>;
}
