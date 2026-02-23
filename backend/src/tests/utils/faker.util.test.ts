import assert from 'node:assert/strict';
import {
  fakeCredentialId,
  fakeIssuer,
  fakePassportHash,
} from '../../shared/utils/faker.util';
import { addTest } from '../harness';

addTest('faker util: issuer has valid DID format', () => {
  const issuer = fakeIssuer();
  assert.match(issuer, /^DID:issuer:[a-z0-9]{10}$/);
});

addTest('faker util: credential id is UUID URN', () => {
  const credentialId = fakeCredentialId();
  assert.match(
    credentialId,
    /^urn:uuid:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/,
  );
});

addTest('faker util: passport hash has 64 hex chars', () => {
  const passportHash = fakePassportHash();
  assert.match(passportHash, /^[a-f0-9]{64}$/);
});
