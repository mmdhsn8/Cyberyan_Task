import { Router, Request, Response } from 'express';
import {
  AuthenticatedRequest,
  authMiddleware,
} from '../../middlewares/auth.middleware';
import { auditLogs, identities } from '../../shared/data/mock.store';
import { AuditResponse } from '../../shared/types';
import { generateAuditHash } from './audit.service';

const router = Router();

router.get('/:did', authMiddleware, async (req: Request, res: Response) => {
  const authReq = req as AuthenticatedRequest;

  try {
    const did = req.params.did;

    if (!did) {
      return res.status(400).json({ message: 'did path parameter is required.' });
    }

    const identity = identities.find(item => item.did === did);

    if (!identity) {
      return res.status(404).json({ message: 'Identity not found for provided DID.' });
    }

    const tokenDid =
      typeof authReq.user === 'object' &&
      authReq.user !== null &&
      'did' in authReq.user &&
      typeof authReq.user.did === 'string'
        ? authReq.user.did
        : null;

    if (!tokenDid || tokenDid !== did) {
      return res.status(403).json({ message: 'Forbidden for requested DID.' });
    }

    const hash = await generateAuditHash(identity.did, identity.vc);
    const timestamp = new Date().toISOString();

    auditLogs.push({
      id: `audit-${Date.now()}-${auditLogs.length + 1}`,
      did: identity.did,
      hash,
      action: 'VC issued',
      timestamp,
    });

    const response: AuditResponse = {
      did: identity.did,
      hash,
      timestamp,
    };

    console.log('Audit record generated and returned successfully.');
    return res.status(200).json(response);
  } catch {
    return res.status(500).json({ message: 'Failed to generate audit hash.' });
  }
});

export const auditRouter = router;
