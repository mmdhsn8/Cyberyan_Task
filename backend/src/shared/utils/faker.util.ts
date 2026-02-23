import { faker } from '@faker-js/faker';

export const fakeIssuer = (): string => {
  return `DID:issuer:${faker.string.alphanumeric({
    length: 10,
    casing: 'lower',
  })}`;
};

export const fakeCredentialId = (): string => {
  return `urn:uuid:${faker.string.uuid()}`;
};

export const fakePassportHash = (): string => {
  return faker.string.hexadecimal({
    length: 64,
    casing: 'lower',
    prefix: '',
  });
};





