const ENCRYPTION_DELIMITER = '.';
const AES_GCM_SCHEME = 'gcm1';
const APP_SECRET = 'cyber0task::secure-local-storage::v1';

type GlobalCrypto = {
  getRandomValues?: (array: Uint8Array) => Uint8Array;
  subtle?: {
    digest?: (...args: any[]) => Promise<ArrayBuffer>;
    importKey?: (...args: any[]) => Promise<unknown>;
    encrypt?: (...args: any[]) => Promise<ArrayBuffer>;
    decrypt?: (...args: any[]) => Promise<ArrayBuffer>;
  };
};

type AesCrypto = {
  getRandomValues: (array: Uint8Array) => Uint8Array;
  subtle: {
    digest: (...args: any[]) => Promise<ArrayBuffer>;
    importKey: (...args: any[]) => Promise<unknown>;
    encrypt: (...args: any[]) => Promise<ArrayBuffer>;
    decrypt: (...args: any[]) => Promise<ArrayBuffer>;
  };
};

type TextEncoderLike = {
  encode: (value: string) => Uint8Array;
};

type TextDecoderLike = {
  decode: (value: Uint8Array) => string;
};

let cachedAesKey: Promise<unknown> | null = null;

const getTextEncoder = (): TextEncoderLike | null => {
  const TextEncoderCtor = (globalThis as unknown as {
    TextEncoder?: new () => TextEncoderLike;
  }).TextEncoder;

  return TextEncoderCtor ? new TextEncoderCtor() : null;
};

const getTextDecoder = (): TextDecoderLike | null => {
  const TextDecoderCtor = (globalThis as unknown as {
    TextDecoder?: new () => TextDecoderLike;
  }).TextDecoder;

  return TextDecoderCtor ? new TextDecoderCtor() : null;
};

const utf8ToBytes = (value: string): Uint8Array => {
  const encoder = getTextEncoder();
  if (encoder) {
    return encoder.encode(value);
  }

  const encoded = encodeURIComponent(value);
  const bytes: number[] = [];

  for (let index = 0; index < encoded.length; index += 1) {
    const currentChar = encoded[index];

    if (currentChar === '%') {
      const hexValue = encoded.slice(index + 1, index + 3);
      bytes.push(Number.parseInt(hexValue, 16));
      index += 2;
      continue;
    }

    bytes.push(currentChar.charCodeAt(0));
  }

  return Uint8Array.from(bytes);
};

const bytesToUtf8 = (bytes: Uint8Array): string => {
  const decoder = getTextDecoder();
  if (decoder) {
    return decoder.decode(bytes);
  }

  let encoded = '';
  for (let index = 0; index < bytes.length; index += 1) {
    encoded += `%${bytes[index].toString(16).padStart(2, '0')}`;
  }

  return decodeURIComponent(encoded);
};

const toHex = (bytes: Uint8Array): string => {
  let hex = '';

  for (let index = 0; index < bytes.length; index += 1) {
    hex += bytes[index].toString(16).padStart(2, '0');
  }

  return hex;
};

const fromHex = (value: string): Uint8Array => {
  if (!value || value.length % 2 !== 0) {
    throw new Error('Invalid hex payload.');
  }

  const output = new Uint8Array(value.length / 2);
  for (let index = 0; index < output.length; index += 1) {
    const hexValue = value.slice(index * 2, index * 2 + 2);
    const parsed = Number.parseInt(hexValue, 16);

    if (Number.isNaN(parsed)) {
      throw new Error('Invalid hex payload.');
    }

    output[index] = parsed;
  }

  return output;
};

const resolveCrypto = (): GlobalCrypto | null => {
  return (globalThis as { crypto?: GlobalCrypto }).crypto ?? null;
};

const hasAesCrypto = (crypto: GlobalCrypto | null): crypto is AesCrypto => {
  return Boolean(
    crypto?.getRandomValues &&
      crypto?.subtle?.digest &&
      crypto?.subtle?.importKey &&
      crypto?.subtle?.encrypt &&
      crypto?.subtle?.decrypt,
  );
};

const canUseAesGcm = (): boolean => {
  return hasAesCrypto(resolveCrypto());
};

const getRandomBytes = (size: number): Uint8Array => {
  const crypto = resolveCrypto();
  if (!hasAesCrypto(crypto)) {
    throw new Error('Secure random generator is unavailable.');
  }

  return crypto.getRandomValues(new Uint8Array(size));
};

const getAesKey = async (): Promise<unknown> => {
  if (cachedAesKey) {
    return cachedAesKey;
  }

  const crypto = resolveCrypto();
  if (!hasAesCrypto(crypto)) {
    throw new Error('AES-GCM is unavailable.');
  }

  cachedAesKey = (async () => {
    const digest = await crypto.subtle.digest('SHA-256', utf8ToBytes(APP_SECRET));
    return crypto.subtle.importKey(
      'raw',
      digest,
      { name: 'AES-GCM' },
      false,
      ['encrypt', 'decrypt'],
    );
  })();

  try {
    return await cachedAesKey;
  } catch (error) {
    cachedAesKey = null;
    throw error;
  }
};

export const isEncryptedPayload = (value: string): boolean => {
  return value.startsWith(`${AES_GCM_SCHEME}${ENCRYPTION_DELIMITER}`);
};

export const encryptString = async (value: string): Promise<string> => {
  if (!canUseAesGcm()) {
    throw new Error('Secure crypto APIs are unavailable on this runtime.');
  }

  const crypto = resolveCrypto();
  if (!hasAesCrypto(crypto)) {
    throw new Error('Secure crypto APIs are unavailable on this runtime.');
  }

  const iv = getRandomBytes(12);
  const key = await getAesKey();
  const encrypted = await crypto.subtle.encrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    utf8ToBytes(value),
  );

  return [AES_GCM_SCHEME, toHex(iv), toHex(new Uint8Array(encrypted))].join(
    ENCRYPTION_DELIMITER,
  );
};

export const decryptString = async (value: string): Promise<string> => {
  const parts = value.split(ENCRYPTION_DELIMITER);
  if (parts.length !== 3 || parts[0] !== AES_GCM_SCHEME) {
    throw new Error('Unsupported encrypted payload.');
  }

  if (!canUseAesGcm()) {
    throw new Error('Secure crypto APIs are unavailable on this runtime.');
  }

  const crypto = resolveCrypto();
  if (!hasAesCrypto(crypto)) {
    throw new Error('Secure crypto APIs are unavailable on this runtime.');
  }

  const iv = fromHex(parts[1]);
  const encrypted = fromHex(parts[2]);
  const key = await getAesKey();
  const decrypted = await crypto.subtle.decrypt(
    {
      name: 'AES-GCM',
      iv,
    },
    key,
    encrypted,
  );

  return bytesToUtf8(new Uint8Array(decrypted));
};
