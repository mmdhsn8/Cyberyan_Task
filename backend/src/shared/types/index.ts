export interface VC {
  id: string;
  issuer: string;
  issuanceDate: string;
  type: ['VerifiableCredential', 'IdentityCredential'];
  credentialSubject: {
    id: string;
    name: string;
    email: string;
    passportHash: string;
  };
}

export interface IdentityRecord {
  did: string;
  email: string;
  vc: VC;
}

export interface RegisterIdentityPayload {
  name: string;
  email: string;
  passportImage: string;
  selfieImage: string;
}

export interface LoginPayload {
  email: string;
}

export interface AuditResponse {
  did: string;
  hash: string;
  timestamp: string;
}

export interface AuditLogRecord {
  id: string;
  did: string;
  hash: string;
  action: 'VC issued';
  timestamp: string;
}
