import { VerifiableCredential } from '../types/identity.types';

export const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString();
};

export const formatMaskedValue = (
  value: string,
  visibleStart = 8,
  visibleEnd = 4,
): string => {
  if (!value) {
    return '-';
  }

  if (value.length <= visibleStart + visibleEnd) {
    return value;
  }

  const maskLength = value.length - (visibleStart + visibleEnd);
  return `${value.slice(0, visibleStart)}${'*'.repeat(maskLength)}${value.slice(-visibleEnd)}`;
};

export const buildQrPayload = (
  did: string | null,
  vc: VerifiableCredential | null,
): string => {
  return JSON.stringify({
    did: did ?? 'N/A',
    vc,
  });
};

