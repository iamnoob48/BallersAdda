import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import { checkEmailLimiter } from '../middleware/rateLimiters.js';
import prisma from '../prismaClient.js';

const router = express.Router();

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.get('/check-email/:email', verifyAccessToken, checkEmailLimiter, async (req, res) => {
  try {
    const { email } = req.params;
    if (!email || !EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Valid email required' });
    }

    const user = await prisma.user.findFirst({
      where: { email: { equals: email, mode: 'insensitive' } },
      select: { id: true },
    });

    return res.status(200).json({ exists: Boolean(user) });
  } catch (error) {
    console.error('Error checking email:', error);
    return res.status(500).json({ message: 'Server error' });
  }
});

export default router;
