import assert from 'node:assert/strict';
import crypto from 'node:crypto';
import { generateAuditHash } from '../../modules/audit/audit.service';
import { VC } from '../../shared/types';
import { addTest } from '../harness';

addTest('audit service: hash matches sha256(did + vc.id + vc.issuanceDate)', async () => {
  const did = 'did:example:testdid1234567890';
  const vc: VC = {
    id: 'urn:uuid:9a244790-131f-4c5f-9de6-c1cc3a8d7ff8',
    issuer: 'did:example:issuer:abc123def4',
    issuanceDate: '2026-02-23T10:00:00.000Z',
    type: ['VerifiableCredential', 'IdentityCredential'],
    credentialSubject: {
      id: 'did:example:testsubject123456',
      name: 'Test User',
      email: 'test@example.com',
      passportHash:
        '0f9c2f4ac57eb75e63e1fd8f19d614f99e0b8c70b714f7a8afbe594056f15f20',
    },
  };

  const expected = crypto
    .createHash('sha256')
    .update(`${did}${vc.id}${vc.issuanceDate}`)
    .digest('hex');

  const actual = await generateAuditHash(did, vc);
  assert.equal(actual, expected);
});

addTest('audit service: hash changes when DID changes', async () => {
  const vc: VC = {
    id: 'urn:uuid:9a244790-131f-4c5f-9de6-c1cc3a8d7ff8',
    issuer: 'did:example:issuer:abc123def4',
    issuanceDate: '2026-02-23T10:00:00.000Z',
    type: ['VerifiableCredential', 'IdentityCredential'],
    credentialSubject: {
      id: 'did:example:testsubject123456',
      name: 'Test User',
      email: 'test@example.com',
      passportHash:
        '0f9c2f4ac57eb75e63e1fd8f19d614f99e0b8c70b714f7a8afbe594056f15f20',
    },
  };

  const first = await generateAuditHash('did:example:firstdid12345678', vc);
  const second = await generateAuditHash('did:example:seconddid1234567', vc);
  assert.notEqual(first, second);
});
