import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuditRecord } from '../../types/audit.types';
import {
  IdentityDataSource,
  IdentityState,
  VerifiableCredential,
} from '../../types/identity.types';
import {
  decryptString,
  encryptString,
  isEncryptedPayload,
} from './encrypted.storage';

const IDENTITY_KEY = '@cyber0task/identity_state';
const isDevelopment = Boolean((globalThis as { __DEV__?: boolean }).__DEV__);

const persistPlaintextIdentityStateInDev = async (
  serializedState: string,
): Promise<void> => {
  if (isDevelopment) {
    await AsyncStorage.setItem(IDENTITY_KEY, serializedState);
    return;
  }

  throw new Error('Secure crypto APIs are unavailable on this runtime.');
};

export type PersistedIdentityState = Pick<
  IdentityState,
  | 'did'
  | 'vc'
  | 'passportImageUri'
  | 'selfieImageUri'
  | 'auditTrail'
  | 'pendingAuthToken'
> & {
  issuanceSource?: IdentityDataSource | null;
};

const isStringOrNull = (value: unknown): value is string | null => {
  return value === null || typeof value === 'string';
};

const isStringOrNullOrUndefined = (
  value: unknown,
): value is string | null | undefined => {
  return value === undefined || value === null || typeof value === 'string';
};

const isIdentityDataSourceOrNullOrUndefined = (
  value: unknown,
): value is IdentityDataSource | null | undefined => {
  return (
    value === undefined ||
    value === null ||
    value === 'backend' ||
    value === 'mock'
  );
};

const isAuditRecord = (value: unknown): value is AuditRecord => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const record = value as Record<string, unknown>;

  return (
    typeof record.id === 'string' &&
    typeof record.hash === 'string' &&
    typeof record.action === 'string' &&
    typeof record.timestamp === 'string'
  );
};

const isVerifiableCredential = (
  value: unknown,
): value is VerifiableCredential => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const credential = value as Record<string, unknown>;
  const credentialSubject = credential.credentialSubject as
    | Record<string, unknown>
    | undefined;

  if (
    typeof credential.id !== 'string' ||
    typeof credential.issuer !== 'string' ||
    typeof credential.issuanceDate !== 'string' ||
    !Array.isArray(credential.type) ||
    credential.type.some(item => typeof item !== 'string') ||
    !credentialSubject
  ) {
    return false;
  }

  return (
    typeof credentialSubject.id === 'string' &&
    typeof credentialSubject.name === 'string' &&
    typeof credentialSubject.email === 'string' &&
    typeof credentialSubject.passportHash === 'string'
  );
};

const isPersistedIdentityState = (
  value: unknown,
): value is PersistedIdentityState => {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const state = value as Record<string, unknown>;

  return (
    isStringOrNull(state.did) &&
    (state.vc === null || isVerifiableCredential(state.vc)) &&
    isStringOrNull(state.passportImageUri) &&
    isStringOrNull(state.selfieImageUri) &&
    Array.isArray(state.auditTrail) &&
    state.auditTrail.every(item => isAuditRecord(item)) &&
    isIdentityDataSourceOrNullOrUndefined(state.issuanceSource) &&
    isStringOrNullOrUndefined(state.pendingAuthToken)
  );
};

export const persistIdentityState = async (
  state: PersistedIdentityState,
): Promise<void> => {
  const serializedState = JSON.stringify(state);

  try {
    const encryptedState = await encryptString(serializedState);
    await AsyncStorage.setItem(IDENTITY_KEY, encryptedState);
  } catch {
    // Plaintext fallback is allowed only during development.
    await persistPlaintextIdentityStateInDev(serializedState);
  }
};

export const getPersistedIdentityState = async (): Promise<PersistedIdentityState | null> => {
  const storedValue = await AsyncStorage.getItem(IDENTITY_KEY);

  if (!storedValue) {
    return null;
  }

  try {
    if (!isEncryptedPayload(storedValue) && !isDevelopment) {
      await AsyncStorage.removeItem(IDENTITY_KEY);
      return null;
    }

    const serializedState = isEncryptedPayload(storedValue)
      ? await decryptString(storedValue)
      : storedValue;
    const parsedState = JSON.parse(serializedState) as unknown;

    if (!isPersistedIdentityState(parsedState)) {
      await AsyncStorage.removeItem(IDENTITY_KEY);
      return null;
    }

    if (!isEncryptedPayload(storedValue)) {
      try {
        await persistIdentityState(parsedState);
      } catch {
        // Keep working with existing data if migration to encrypted storage fails.
      }
    }

    return parsedState;
  } catch {
    await AsyncStorage.removeItem(IDENTITY_KEY);
    return null;
  }
};

export const clearPersistedIdentityState = async (): Promise<void> => {
  await AsyncStorage.removeItem(IDENTITY_KEY);
};
