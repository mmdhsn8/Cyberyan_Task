import crypto from 'crypto';
import { VC } from '../../shared/types';

export const generateAuditHash = async (did: string, vc: VC): Promise<string> => {
  const seed = `${did}${vc.id}${vc.issuanceDate}`;
  return crypto.createHash('sha256').update(seed).digest('hex');
};