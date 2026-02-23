import { VerifiableCredential } from '../../types/identity.types';
import { buildQrPayload, formatMaskedValue } from '../../utils/formatters';

describe('formatMaskedValue', () => {
  it('returns "-" for empty values', () => {
    expect(formatMaskedValue('')).toBe('-');
  });

  it('returns original value when it is shorter than visible range', () => {
    expect(formatMaskedValue('DID:123')).toBe('DID:123');
  });

  it('masks middle of long values with default ranges', () => {
    expect(formatMaskedValue('DID:abcdefghijklmnop')).toBe('DID:abcd********mnop');
  });

  it('supports custom visible ranges', () => {
    expect(formatMaskedValue('1234567890', 2, 2)).toBe('12******90');
  });
});

describe('buildQrPayload', () => {
  it('serializes DID and VC into a JSON payload', () => {
    const vc: VerifiableCredential = {
      id: 'urn:uuid:test-vc',
      issuer: 'DID:issuer:test',
      issuanceDate: '2026-02-23T10:00:00.000Z',
      type: ['VerifiableCredential', 'IdentityCredential'],
      credentialSubject: {
        id: 'DID:test',
        name: 'Test User',
        email: 'test@example.com',
        passportHash:
          '0f9c2f4ac57eb75e63e1fd8f19d614f99e0b8c70b714f7a8afbe594056f15f20',
      },
    };

    const payload = buildQrPayload('DID:test', vc);
    const parsed = JSON.parse(payload) as { did: string; vc: VerifiableCredential };

    expect(parsed.did).toBe('DID:test');
    expect(parsed.vc.id).toBe('urn:uuid:test-vc');
    expect(parsed.vc.credentialSubject.email).toBe('test@example.com');
  });

  it('uses N/A when DID is null', () => {
    const parsed = JSON.parse(
      buildQrPayload(null, null),
    ) as {
      did: string;
      vc: null;
    };

    expect(parsed.did).toBe('N/A');
    expect(parsed.vc).toBeNull();
  });
});
