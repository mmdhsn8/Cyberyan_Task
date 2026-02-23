import { Router, Request, Response } from 'express';
import { LoginPayload } from '../../shared/types';
import { login } from './auth.service';

const router = Router();
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email } = req.body as Partial<LoginPayload>;

    if (typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ message: 'email is required.' });
    }

    if (!EMAIL_REGEX.test(email.trim().toLowerCase())) {
      return res.status(400).json({ message: 'email format is invalid.' });
    }

    const token = await login(email);
    return res.status(200).json({ token });
  } catch (error) {
    if (error instanceof Error && error.message === 'IDENTITY_NOT_FOUND') {
      return res.status(404).json({ message: 'Identity not found for this email.' });
    }

    return res.status(500).json({ message: 'Failed to login.' });
  }
});

export const authRouter = router;
