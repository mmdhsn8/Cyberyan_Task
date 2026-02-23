import assert from 'node:assert/strict';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET, login } from '../../modules/auth/auth.service';
import { identities } from '../../shared/data/mock.store';
import { VC } from '../../shared/types';
import { addTest } from '../harness';

const resetStore = () => {
  identities.length = 0;
};

addTest('auth service: login returns JWT with normalized subject and DID', async () => {
  resetStore();

  const did = 'did:example:testdid1234567890';
  const vc: VC = {
    id: 'urn:uuid:9a244790-131f-4c5f-9de6-c1cc3a8d7ff8',
    issuer: 'did:example:issuer:abc123def4',
    issuanceDate: '2026-02-23T00:00:00.000Z',
    type: ['VerifiableCredential', 'IdentityCredential'],
    credentialSubject: {
      id: did,
      name: 'Test User',
      email: 'test@example.com',
      passportHash:
        '0f9c2f4ac57eb75e63e1fd8f19d614f99e0b8c70b714f7a8afbe594056f15f20',
    },
  };

  identities.push({
    did,
    email: 'test@example.com',
    vc,
  });

  const token = await login(' TEST@EXAMPLE.COM ');
  const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

  assert.equal(decoded.sub, 'test@example.com');
  assert.equal(decoded.did, did);
  assert.equal(typeof decoded.exp, 'number');
});

addTest('auth service: login throws for unknown identity', async () => {
  resetStore();
  await assert.rejects(async () => {
    await login('missing@example.com');
  }, /IDENTITY_NOT_FOUND/);
});
