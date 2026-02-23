"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const audit_routes_1 = require("./modules/audit/audit.routes");
const auth_routes_1 = require("./modules/auth/auth.routes");
const identity_routes_1 = require("./modules/identity/identity.routes");
const app = (0, express_1.default)();
const PORT = 4000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use('/api/auth', auth_routes_1.authRouter);
app.use('/api', identity_routes_1.identityRouter);
app.use('/api/audit', audit_routes_1.auditRouter);
app.use((_, res) => {
    return res.status(404).json({ message: 'Route not found.' });
});
app.listen(PORT, () => {
    console.log(`Mock DID + VC backend running on port ${PORT}`);
});
