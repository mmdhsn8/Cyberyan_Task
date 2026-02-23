"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerIdentity = exports.generateVC = exports.generateDID = void 0;
const faker_1 = require("@faker-js/faker");
const mock_store_1 = require("../../shared/data/mock.store");
const faker_util_1 = require("../../shared/utils/faker.util");
const generateDID = () => {
    const randomPart = faker_1.faker.string.alphanumeric({
        length: 20,
        casing: 'lower',
    });
    return `DID:${randomPart}`;
};
exports.generateDID = generateDID;
const generateVC = async (name, email, did) => {
    return {
        id: (0, faker_util_1.fakeCredentialId)(),
        issuer: (0, faker_util_1.fakeIssuer)(),
        issuanceDate: new Date().toISOString(),
        type: ['VerifiableCredential', 'IdentityCredential'],
        credentialSubject: {
            id: did,
            name,
            email,
            passportHash: (0, faker_util_1.fakePassportHash)(),
        },
    };
};
exports.generateVC = generateVC;
const registerIdentity = async (data) => {
    const normalizedEmail = data.email.trim().toLowerCase();
    const did = (0, exports.generateDID)();
    const vc = await (0, exports.generateVC)(data.name.trim(), normalizedEmail, did);
    // Images are accepted as filenames/strings for mock flow, without upload storage.
    void data.passportImage;
    void data.selfieImage;
    const existingIndex = mock_store_1.identities.findIndex(item => item.email === normalizedEmail);
    if (existingIndex >= 0) {
        mock_store_1.identities.splice(existingIndex, 1);
    }
    mock_store_1.identities.push({ did, email: normalizedEmail, vc });
    return { did, vc };
};
exports.registerIdentity = registerIdentity;
