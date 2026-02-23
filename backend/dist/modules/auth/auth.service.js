"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.login = exports.JWT_SECRET = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const mock_store_1 = require("../../shared/data/mock.store");
exports.JWT_SECRET = 'mock-secret';
const login = async (email) => {
    const normalizedEmail = email.trim().toLowerCase();
    const identity = mock_store_1.identities.find(item => item.email === normalizedEmail);
    if (!identity) {
        throw new Error('IDENTITY_NOT_FOUND');
    }
    return jsonwebtoken_1.default.sign({
        sub: normalizedEmail,
        did: identity.did,
    }, exports.JWT_SECRET, {
        expiresIn: '1h',
    });
};
exports.login = login;
