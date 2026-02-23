import {
  IDENTITY_SERVICE_UNAVAILABLE_ERROR,
  registerIdentity,
} from '../../services/api/identity.service';
import { apiClient, isBackendUnavailable } from '../../services/api/client';

jest.mock('../../services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
  isBackendUnavailable: jest.fn(),
}));

const mockedPost = apiClient.post as jest.Mock;
const mockedIsBackendUnavailable = isBackendUnavailable as jest.Mock;

describe('registerIdentity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes payload and returns backend source on success', async () => {
    mockedPost.mockResolvedValue({
      data: {
        did: 'DID:test1234567890',
        vc: {
          id: 'urn:uuid:test',
          issuer: 'DID:issuer:test',
          issuanceDate: '2026-02-23T10:00:00.000Z',
          type: ['VerifiableCredential', 'IdentityCredential'],
          credentialSubject: {
            id: 'DID:test1234567890',
            name: 'Ali',
            email: 'ali@example.com',
            passportHash:
              '0f9c2f4ac57eb75e63e1fd8f19d614f99e0b8c70b714f7a8afbe594056f15f20',
          },
        },
      },
    });

    const result = await registerIdentity({
      name: '  Ali  ',
      email: ' ALI@Example.com ',
      passportImage: 'file:///passport.jpg',
      selfieImage: 'file:///selfie.jpg',
    });

    expect(mockedPost).toHaveBeenCalledWith('/register', {
      name: 'Ali',
      email: 'ali@example.com',
      passportImage: 'file:///passport.jpg',
      selfieImage: 'file:///selfie.jpg',
    });
    expect(result.dataSource).toBe('backend');
    expect(result.did).toBe('DID:test1234567890');
  });

  it('throws IDENTITY_SERVICE_UNAVAILABLE_ERROR when backend is unavailable', async () => {
    mockedPost.mockRejectedValue(new Error('network error'));
    mockedIsBackendUnavailable.mockReturnValue(true);

    await expect(
      registerIdentity({
        name: 'Ali',
        email: 'ali@example.com',
        passportImage: 'file:///passport.jpg',
        selfieImage: 'file:///selfie.jpg',
      }),
    ).rejects.toThrow(IDENTITY_SERVICE_UNAVAILABLE_ERROR);
  });

  it('rethrows non-network errors', async () => {
    const error = new Error('validation failed');
    mockedPost.mockRejectedValue(error);
    mockedIsBackendUnavailable.mockReturnValue(false);

    await expect(
      registerIdentity({
        name: 'Ali',
        email: 'ali@example.com',
        passportImage: 'file:///passport.jpg',
        selfieImage: 'file:///selfie.jpg',
      }),
    ).rejects.toThrow('validation failed');
  });
});
