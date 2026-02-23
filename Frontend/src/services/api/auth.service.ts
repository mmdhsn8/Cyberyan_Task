import { IdentityDataSource } from '../../types/identity.types';
import { apiClient, isBackendUnavailable } from './client';

export const AUTH_SERVICE_UNAVAILABLE_ERROR = 'AUTH_SERVICE_UNAVAILABLE';

export const isAuthServiceUnavailableError = (error: unknown): boolean => {
  return (
    error instanceof Error &&
    error.message === AUTH_SERVICE_UNAVAILABLE_ERROR
  );
};

interface LoginResponse {
  token: string;
}

export interface LoginResult {
  token: string;
  dataSource: IdentityDataSource;
}

export const loginUser = async (email: string): Promise<LoginResult> => {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const response = await apiClient.post<LoginResponse>('/auth/login', {
      email: normalizedEmail,
    });

    return {
      token: response.data.token,
      // baraye fallback dar sorat nabod backend (mock source is intentionally reserved)
      dataSource: 'backend',
    };
  } catch (error) {
    if (isBackendUnavailable(error)) {
      throw new Error(AUTH_SERVICE_UNAVAILABLE_ERROR);
    }

    throw error;
  }
};
