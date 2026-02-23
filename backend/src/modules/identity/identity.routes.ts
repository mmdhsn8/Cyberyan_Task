import { Router, Request, Response } from 'express';
import { RegisterIdentityPayload } from '../../shared/types';
import { registerIdentity } from './identity.service';

const router = Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { name, email, passportImage, selfieImage } =
      req.body as Partial<RegisterIdentityPayload>;

    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof passportImage !== 'string' ||
      typeof selfieImage !== 'string' ||
      !name.trim() ||
      !email.trim() ||
      !passportImage.trim() ||
      !selfieImage.trim()
    ) {
      return res.status(400).json({
        message: 'name, email, passportImage, and selfieImage are required.',
      });
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json({
        message: 'email format is invalid.',
      });
    }

    const result = await registerIdentity({
      name,
      email,
      passportImage,
      selfieImage,
    });

    console.log('Identity registered successfully and wallet data generated.');
  
    return res.status(201).json(result);
  } catch {
    return res.status(500).json({ message: 'Failed to register identity.' });
  }
});

export const identityRouter = router;
