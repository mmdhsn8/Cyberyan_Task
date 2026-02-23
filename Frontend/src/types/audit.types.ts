export interface AuditRecord {
  id: string;
  hash: string;
  action: string;
  timestamp: string;
}

export interface AuditApiResponse {
  did: string;
  hash: string;
  timestamp: string;
}
