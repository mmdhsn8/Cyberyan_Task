import {
  AUTH_SERVICE_UNAVAILABLE_ERROR,
  loginUser,
} from '../../services/api/auth.service';
import { apiClient, isBackendUnavailable } from '../../services/api/client';

jest.mock('../../services/api/client', () => ({
  apiClient: {
    post: jest.fn(),
  },
  isBackendUnavailable: jest.fn(),
}));

const mockedPost = apiClient.post as jest.Mock;
const mockedIsBackendUnavailable = isBackendUnavailable as jest.Mock;

describe('loginUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('normalizes email and returns backend data source on success', async () => {
    mockedPost.mockResolvedValue({
      data: { token: 'mock-jwt-token' },
    });

    const result = await loginUser(' USER@Example.COM ');

    expect(mockedPost).toHaveBeenCalledWith('/auth/login', {
      email: 'user@example.com',
    });
    expect(result).toEqual({
      token: 'mock-jwt-token',
      dataSource: 'backend',
    });
  });

  it('throws AUTH_SERVICE_UNAVAILABLE_ERROR when backend is unavailable', async () => {
    mockedPost.mockRejectedValue(new Error('network error'));
    mockedIsBackendUnavailable.mockReturnValue(true);

    await expect(loginUser('user@example.com')).rejects.toThrow(
      AUTH_SERVICE_UNAVAILABLE_ERROR,
    );
  });

  it('rethrows non-network errors', async () => {
    const error = new Error('bad request');
    mockedPost.mockRejectedValue(error);
    mockedIsBackendUnavailable.mockReturnValue(false);

    await expect(loginUser('user@example.com')).rejects.toThrow('bad request');
  });
});
