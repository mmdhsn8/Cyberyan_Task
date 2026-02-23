import { faker } from '@faker-js/faker';
import crypto from 'crypto';
import { identities } from '../../shared/data/mock.store';
import { RegisterIdentityPayload, VC } from '../../shared/types';
import {
  fakeCredentialId,
  fakeIssuer,
} from '../../shared/utils/faker.util';

export const generateDID = (): string => {
  const randomPart = faker.string.alphanumeric({
    length: 20,
    casing: 'lower',
  });

  return `DID:${randomPart}`;
};

export const generateVC = async (
  name: string,
  email: string,
  did: string,
  passportHash: string,
): Promise<VC> => {
  return {
    id: fakeCredentialId(),
    issuer: fakeIssuer(),
    issuanceDate: new Date().toISOString(),
    type: ['VerifiableCredential', 'IdentityCredential'],
    credentialSubject: {
      id: did,
      name,
      email,
      passportHash,
    },
  };
};

export const registerIdentity = async (
  data: RegisterIdentityPayload,
): Promise<{ did: string; vc: VC }> => {
  const normalizedName = data.name.trim();
  const normalizedEmail = data.email.trim().toLowerCase();
  const normalizedPassportImage = data.passportImage.trim();
  const did = generateDID();
  const passportHash = crypto
    .createHash('sha256')
    .update(normalizedPassportImage)
    .digest('hex');
  const vc = await generateVC(
    normalizedName,
    normalizedEmail,
    did,
    passportHash,
  );

  // Images are accepted as filenames/strings for mock flow, without upload storage.
  void data.selfieImage;

  const existingIndex = identities.findIndex(item => item.email === normalizedEmail);
  if (existingIndex >= 0) {
    identities.splice(existingIndex, 1);
  }

  identities.push({ did, email: normalizedEmail, vc });

  return { did, vc };
};
