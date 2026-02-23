"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.auditRouter = void 0;
const express_1 = require("express");
const auth_middleware_1 = require("../../middlewares/auth.middleware");
const mock_store_1 = require("../../shared/data/mock.store");
const audit_service_1 = require("./audit.service");
const router = (0, express_1.Router)();
router.get('/:did', auth_middleware_1.authMiddleware, async (req, res) => {
    try {
        const did = req.params.did;
        if (!did) {
            return res.status(400).json({ message: 'did path parameter is required.' });
        }
        const identity = mock_store_1.identities.find(item => item.did === did);
        if (!identity) {
            return res.status(404).json({ message: 'Identity not found for provided DID.' });
        }
        const hash = await (0, audit_service_1.generateAuditHash)(identity.did, identity.vc);
        const timestamp = new Date().toISOString();
        mock_store_1.auditLogs.push({
            id: `audit-${Date.now()}-${mock_store_1.auditLogs.length + 1}`,
            did: identity.did,
            hash,
            action: 'VC issued',
            timestamp,
        });
        const response = {
            did: identity.did,
            hash,
            timestamp,
        };
        return res.status(200).json(response);
    }
    catch {
        return res.status(500).json({ message: 'Failed to generate audit hash.' });
    }
});
exports.auditRouter = router;
