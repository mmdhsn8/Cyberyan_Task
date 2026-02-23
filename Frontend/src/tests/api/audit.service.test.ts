import { VerifiableCredential } from '../../types/identity.types';
import {
  AUDIT_SERVICE_UNAVAILABLE_ERROR,
  fetchIssuanceAuditRecord,
} from '../../services/api/audit.service';
import { apiClient, isBackendUnavailable } from '../../services/api/client';

jest.mock('../../services/api/client', () => ({
  apiClient: {
    get: jest.fn(),
  },
  isBackendUnavailable: jest.fn(),
}));

const mockedGet = apiClient.get as jest.Mock;
const mockedIsBackendUnavailable = isBackendUnavailable as jest.Mock;

const sampleVc: VerifiableCredential = {
  id: 'urn:uuid:test',
  issuer: 'DID:issuer:test',
  issuanceDate: '2026-02-23T10:00:00.000Z',
  type: ['VerifiableCredential', 'IdentityCredential'],
  credentialSubject: {
    id: 'DID:test',
    name: 'Ali',
    email: 'ali@example.com',
    passportHash:
      '0f9c2f4ac57eb75e63e1fd8f19d614f99e0b8c70b714f7a8afbe594056f15f20',
  },
};

describe('fetchIssuanceAuditRecord', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('maps API response into an audit record with backend source', async () => {
    mockedGet.mockResolvedValue({
      data: {
        did: 'DID:test',
        hash: 'abc123hash',
        timestamp: '2026-02-23T10:05:00.000Z',
      },
    });

    const result = await fetchIssuanceAuditRecord('DID:test', sampleVc);

    expect(mockedGet).toHaveBeenCalledWith('/audit/DID%3Atest', undefined);
    expect(result.dataSource).toBe('backend');
    expect(result.record).toEqual({
      id: 'audit-2026-02-23T10:05:00.000Z-abc123ha',
      hash: 'abc123hash',
      action: 'VC issued',
      timestamp: '2026-02-23T10:05:00.000Z',
    });
  });

  it('sends authorization header when token exists', async () => {
    mockedGet.mockResolvedValue({
      data: {
        did: 'DID:test',
        hash: 'abc123hash',
        timestamp: '2026-02-23T10:05:00.000Z',
      },
    });

    await fetchIssuanceAuditRecord('DID:test', sampleVc, 'jwt-token');

    expect(mockedGet).toHaveBeenCalledWith('/audit/DID%3Atest', {
      headers: {
        Authorization: 'Bearer jwt-token',
      },
    });
  });

  it('throws AUDIT_SERVICE_UNAVAILABLE_ERROR when backend is unavailable', async () => {
    mockedGet.mockRejectedValue(new Error('network error'));
    mockedIsBackendUnavailable.mockReturnValue(true);

    await expect(
      fetchIssuanceAuditRecord('DID:test', sampleVc, 'jwt-token'),
    ).rejects.toThrow(AUDIT_SERVICE_UNAVAILABLE_ERROR);
  });

  it('rethrows non-network errors', async () => {
    const error = new Error('forbidden');
    mockedGet.mockRejectedValue(error);
    mockedIsBackendUnavailable.mockReturnValue(false);

    await expect(
      fetchIssuanceAuditRecord('DID:test', sampleVc, 'jwt-token'),
    ).rejects.toThrow('forbidden');
  });
});
