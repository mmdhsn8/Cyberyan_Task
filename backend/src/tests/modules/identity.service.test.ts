import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import {
  generateDID,
  registerIdentity,
} from '../../modules/identity/identity.service';
import { identities } from '../../shared/data/mock.store';
import { addTest } from '../harness';

const resetStore = () => {
  identities.length = 0;
};

addTest('identity service: generateDID format is valid', () => {
  const did = generateDID();
  assert.match(did, /^DID:[a-z0-9]{20}$/);
});

addTest('identity service: registerIdentity normalizes and stores VC', async () => {
  resetStore();

  const passportImage = '  file:///passport.png  ';
  const expectedPassportHash = crypto
    .createHash('sha256')
    .update(passportImage.trim())
    .digest('hex');

  const result = await registerIdentity({
    name: '  Ali Rezaei  ',
    email: '  ALI@Example.com ',
    passportImage,
    selfieImage: 'file:///selfie.png',
  });

  assert.equal(result.vc.credentialSubject.id, result.did);
  assert.equal(result.vc.credentialSubject.name, 'Ali Rezaei');
  assert.equal(result.vc.credentialSubject.email, 'ali@example.com');
  assert.equal(result.vc.credentialSubject.passportHash, expectedPassportHash);
  assert.equal(identities.length, 1);
  assert.equal(identities[0].email, 'ali@example.com');
});

addTest('identity service: same email replaces existing identity record', async () => {
  resetStore();

  const first = await registerIdentity({
    name: 'First User',
    email: 'user@example.com',
    passportImage: 'file:///passport-first.png',
    selfieImage: 'file:///selfie-first.png',
  });

  const second = await registerIdentity({
    name: 'Second User',
    email: '  USER@example.com  ',
    passportImage: 'file:///passport-second.png',
    selfieImage: 'file:///selfie-second.png',
  });

  assert.notEqual(first.did, second.did);
  assert.equal(identities.length, 1);
  assert.equal(identities[0].did, second.did);
  assert.equal(identities[0].email, 'user@example.com');
  assert.equal(identities[0].vc.credentialSubject.name, 'Second User');
});
