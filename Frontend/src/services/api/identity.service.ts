import {
  IdentityDataSource,
  VerifiableCredential,
} from '../../types/identity.types';
import { apiClient, isBackendUnavailable } from './client';

export const IDENTITY_SERVICE_UNAVAILABLE_ERROR = 'IDENTITY_SERVICE_UNAVAILABLE';

export const isIdentityServiceUnavailableError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    error.message === IDENTITY_SERVICE_UNAVAILABLE_ERROR
  );
};

export interface RegisterIdentityPayload {
  name: string;
  email: string;
  passportImage: string;
  selfieImage: string;
}

interface RegisterIdentityResponse {
  did: string;
  vc: VerifiableCredential;
}

export interface RegisterIdentityResult extends RegisterIdentityResponse {
  dataSource: IdentityDataSource;
}

export const registerIdentity = async (
  payload: RegisterIdentityPayload,
): Promise<RegisterIdentityResult> => {
  try {
    const response = await apiClient.post<RegisterIdentityResponse>(
      '/register',
      {
        name: payload.name.trim(),
        email: payload.email.trim().toLowerCase(),
        passportImage: payload.passportImage,
        selfieImage: payload.selfieImage,
      },
    );

    return {
      ...response.data,
      // baraye fallback dar sorat nabod backend (mock source is intentionally reserved)
      dataSource: 'backend',
    };
  } catch (error) {
    if (isBackendUnavailable(error)) {
      throw new Error(IDENTITY_SERVICE_UNAVAILABLE_ERROR);
    }

    throw error;
  }
};
