import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserProfile } from '../../types/auth.types';
import {
  decryptString,
  encryptString,
  isEncryptedPayload,
} from './encrypted.storage';

const PROFILE_KEY = '@cyber0task/user_profile';
const isDevelopment = Boolean((globalThis as { __DEV__?: boolean }).__DEV__);

const persistPlaintextProfileInDev = async (
  serializedProfile: string,
): Promise<void> => {
  if (isDevelopment) {
    await AsyncStorage.setItem(PROFILE_KEY, serializedProfile);
    return;
  }

  throw new Error('Secure crypto APIs are unavailable on this runtime.');
};

const isUserProfile = (value: unknown): value is UserProfile => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const profile = value as Record<string, unknown>;

  return (
    typeof profile.id === 'string' &&
    typeof profile.name === 'string' &&
    typeof profile.email === 'string'
  );
};

export const persistProfile = async (profile: UserProfile): Promise<void> => {
  const serializedProfile = JSON.stringify(profile);

  try {
    const encryptedProfile = await encryptString(serializedProfile);
    await AsyncStorage.setItem(PROFILE_KEY, encryptedProfile);
  } catch {
    // Plaintext fallback is allowed only during development.
    await persistPlaintextProfileInDev(serializedProfile);
  }
};

export const getPersistedProfile = async (): Promise<UserProfile | null> => {
  const storedValue = await AsyncStorage.getItem(PROFILE_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    if (!isEncryptedPayload(storedValue) && !isDevelopment) {
      await AsyncStorage.removeItem(PROFILE_KEY);
      return null;
    }

    const serializedProfile = isEncryptedPayload(storedValue)
      ? await decryptString(storedValue)
      : storedValue;
    const parsedProfile = JSON.parse(serializedProfile) as unknown;

    if (!isUserProfile(parsedProfile)) {
      await AsyncStorage.removeItem(PROFILE_KEY);
      return null;
    }

    if (!isEncryptedPayload(storedValue)) {
      try {
        await persistProfile(parsedProfile);
      } catch {
        // Keep working with existing data if migration to encrypted storage fails.
      }
    }

    return parsedProfile;
  } catch {
    await AsyncStorage.removeItem(PROFILE_KEY);
    return null;
  }
};

export const clearPersistedProfile = async (): Promise<void> => {
  await AsyncStorage.removeItem(PROFILE_KEY);
};
