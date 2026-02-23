"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.identityRouter = void 0;
const express_1 = require("express");
const identity_service_1 = require("./identity.service");
const router = (0, express_1.Router)();
router.post('/register', async (req, res) => {
    try {
        const { name, email, passportImage, selfieImage } = req.body;
        if (typeof name !== 'string' ||
            typeof email !== 'string' ||
            typeof passportImage !== 'string' ||
            typeof selfieImage !== 'string' ||
            !name.trim() ||
            !email.trim() ||
            !passportImage.trim() ||
            !selfieImage.trim()) {
            return res.status(400).json({
                message: 'name, email, passportImage, and selfieImage are required.',
            });
        }
        const result = await (0, identity_service_1.registerIdentity)({
            name,
            email,
            passportImage,
            selfieImage,
        });
        return res.status(201).json(result);
    }
    catch {
        return res.status(500).json({ message: 'Failed to register identity.' });
    }
});
exports.identityRouter = router;
