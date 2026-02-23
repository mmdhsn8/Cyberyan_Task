import jwt from 'jsonwebtoken';
import { identities } from '../../shared/data/mock.store';

const loadEnvFile =
  (process as NodeJS.Process & { loadEnvFile?: (path?: string) => void })
    .loadEnvFile;

if (typeof loadEnvFile === 'function') {
  try {
    loadEnvFile();
  } catch (error) {
    const hasMissingEnvFileError =
      error instanceof Error &&
      'code' in error &&
      error.code === 'ENOENT';

    if (!hasMissingEnvFileError) {
      throw error;
    }
  }
}

const envJwtSecret = process.env.JWT_SECRET?.trim();
const isProduction = process.env.NODE_ENV === 'production';

if (!envJwtSecret && isProduction) {
  throw new Error('JWT_SECRET is required in production environment.');
}

export const JWT_SECRET = envJwtSecret || 'mock-secret';

export const login = async (email: string): Promise<string> => {
  const normalizedEmail = email.trim().toLowerCase();
  const identity = identities.find(item => item.email === normalizedEmail);

  if (!identity) {
    throw new Error('IDENTITY_NOT_FOUND');
  }

  return jwt.sign(
    {
      sub: normalizedEmail,
      did: identity.did,
    },
    JWT_SECRET,
    {
      expiresIn: '1h',
    },
  );
};
