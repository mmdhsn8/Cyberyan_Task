import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  decryptString,
  encryptString,
  isEncryptedPayload,
} from './encrypted.storage';

const TOKEN_KEY = '@cyber0task/mock_jwt';
const isDevelopment = Boolean((globalThis as { __DEV__?: boolean }).__DEV__);

const persistPlaintextTokenInDev = async (token: string): Promise<void> => {
  if (isDevelopment) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
    return;
  }

  throw new Error('Secure crypto APIs are unavailable on this runtime.');
};

export const persistToken = async (token: string): Promise<void> => {
  try {
    const encryptedToken = await encryptString(token);
    await AsyncStorage.setItem(TOKEN_KEY, encryptedToken);
  } catch {
    // Plaintext fallback is allowed only during development.
    await persistPlaintextTokenInDev(token);
  }
};

export const getToken = async (): Promise<string | null> => {
  const storedValue = await AsyncStorage.getItem(TOKEN_KEY);

  if (!storedValue) {
    return null;
  }

  if (!isEncryptedPayload(storedValue)) {
    if (!isDevelopment) {
      await AsyncStorage.removeItem(TOKEN_KEY);
      return null;
    }

    try {
      await persistToken(storedValue);
    } catch {
      // Keep existing value in memory even if migration to encrypted storage fails.
    }

    return storedValue;
  }

  try {
    return await decryptString(storedValue);
  } catch {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return null;
  }
};

export const clearToken = async (): Promise<void> => {
  await AsyncStorage.removeItem(TOKEN_KEY);
};
