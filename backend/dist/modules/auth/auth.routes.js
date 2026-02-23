"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authRouter = void 0;
const express_1 = require("express");
const auth_service_1 = require("./auth.service");
const router = (0, express_1.Router)();
router.post('/login', async (req, res) => {
    try {
        const { email } = req.body;
        if (typeof email !== 'string' || !email.trim()) {
            return res.status(400).json({ message: 'email is required.' });
        }
        const token = await (0, auth_service_1.login)(email);
        return res.status(200).json({ token });
    }
    catch (error) {
        if (error instanceof Error && error.message === 'IDENTITY_NOT_FOUND') {
            return res.status(404).json({ message: 'Identity not found for this email.' });
        }
        return res.status(500).json({ message: 'Failed to login.' });
    }
});
exports.authRouter = router;
