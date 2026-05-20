import { auth } from '../lib/auth.js';
import { fromNodeHeaders } from 'better-auth/node';

export const verifyAccessToken = async (req, res, next) => {
  try {
    const session = await auth.api.getSession({
      headers: fromNodeHeaders(req.headers),
    });

    if (!session) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    if (session.user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is suspended or deleted' });
    }

    req.user = {
      id: session.user.id,
      role: session.user.role,
      email: session.user.email,
    };

    next();
  } catch {
    return res.status(401).json({ message: 'Not authenticated' });
  }
};

export const verifyAccessTokenStrict = verifyAccessToken;

export const isCoach = (req, res, next) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'COACH') return res.status(403).json({ message: 'Forbidden: Requires Coach access' });
  next();
};

