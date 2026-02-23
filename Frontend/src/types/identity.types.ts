import { AuditRecord } from './audit.types';

// baraye fallback dar sorat nabod backend (planned backend-unavailable fallback source)
export type IdentityDataSource = 'backend' | 'mock';

export interface VerifiableCredential {
  id: string;
  issuer: string;
  issuanceDate: string;
  type: string[];
  credentialSubject: {
    id: string;
    name: string;
    email: string;
    passportHash: string;
  };
}

export interface IdentityState {
  did: string | null;
  vc: VerifiableCredential | null;
  passportImageUri: string | null;
  selfieImageUri: string | null;
  auditTrail: AuditRecord[];
  issuanceSource: IdentityDataSource | null;
  pendingAuthToken: string | null;
}

export type IdentityAction =
  | { type: 'BOOTSTRAP_IDENTITY'; payload: IdentityState }
  | { type: 'SET_PASSPORT_IMAGE'; payload: string | null }
  | { type: 'SET_SELFIE_IMAGE'; payload: string | null }
  | {
      type: 'SET_IDENTITY';
      payload: {
        did: string;
        vc: VerifiableCredential;
        auditTrail: AuditRecord[];
        issuanceSource: IdentityDataSource;
        pendingAuthToken: string;
      };
    }
  | { type: 'CLEAR_TRANSIENT_IDENTITY' }
  | { type: 'RESET_IDENTITY' };

export interface IdentityContextValue {
  state: IdentityState;
  setPassportImage: (uri: string | null) => void;
  setSelfieImage: (uri: string | null) => void;
  setIdentityPayload: (payload: {
    did: string;
    vc: VerifiableCredential;
    auditTrail: AuditRecord[];
    issuanceSource: IdentityDataSource;
    pendingAuthToken: string;
  }) => void;
  clearTransientIdentityData: () => void;
  resetIdentity: () => void;
}
