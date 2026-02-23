import { AuditApiResponse, AuditRecord } from '../../types/audit.types';
import {
  IdentityDataSource,
  VerifiableCredential,
} from '../../types/identity.types';
import { apiClient, isBackendUnavailable } from './client';

export const AUDIT_SERVICE_UNAVAILABLE_ERROR = 'AUDIT_SERVICE_UNAVAILABLE';

export const isAuditServiceUnavailableError = (error: unknown): boolean => {
  return (
    error instanceof Error && error.message === AUDIT_SERVICE_UNAVAILABLE_ERROR
  );
};

const toAuditRecord = (payload: AuditApiResponse): AuditRecord => {
  return {
    id: `audit-${payload.timestamp}-${payload.hash.slice(0, 8)}`,
    hash: payload.hash,
    action: 'VC issued',
    timestamp: payload.timestamp,
  };
};

export interface IssuanceAuditResult {
  record: AuditRecord;
  dataSource: IdentityDataSource;
}

export const fetchIssuanceAuditRecord = async (
  did: string,
  _vc: VerifiableCredential,
  token?: string,
): Promise<IssuanceAuditResult> => {
  try {
    const response = await apiClient.get<AuditApiResponse>(
      `/audit/${encodeURIComponent(did)}`,
      token
        ? {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        : undefined,
    );

    return {
      record: toAuditRecord(response.data),
      // baraye fallback dar sorat nabod backend (mock source is intentionally reserved)
      dataSource: 'backend',
    };
  } catch (error) {
    if (isBackendUnavailable(error)) {
      throw new Error(AUDIT_SERVICE_UNAVAILABLE_ERROR);
    }

    throw error;
  }
};
