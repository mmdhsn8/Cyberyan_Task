import cors from 'cors';
import express from 'express';
import { auditRouter } from './modules/audit/audit.routes';
import { authRouter } from './modules/auth/auth.routes';
import { identityRouter } from './modules/identity/identity.routes';

const app = express();
const PORT = 4000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRouter);
app.use('/api', identityRouter);
app.use('/api/audit', auditRouter);

app.use((_, res) => {
  return res.status(404).json({ message: 'Route not found.' });
});

app.listen(PORT, () => {
  console.log(`backend running on port ${PORT}`);
});
