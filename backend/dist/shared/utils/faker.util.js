"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fakePassportHash = exports.fakeCredentialId = exports.fakeIssuer = void 0;
const faker_1 = require("@faker-js/faker");
const fakeIssuer = () => {
    return `DID:issuer:${faker_1.faker.string.alphanumeric({
        length: 10,
        casing: 'lower',
    })}`;
};
exports.fakeIssuer = fakeIssuer;
const fakeCredentialId = () => {
    return `urn:uuid:${faker_1.faker.string.uuid()}`;
};
exports.fakeCredentialId = fakeCredentialId;
const fakePassportHash = () => {
    return faker_1.faker.string.hexadecimal({
        length: 64,
        casing: 'lower',
        prefix: '',
    });
};
exports.fakePassportHash = fakePassportHash;
