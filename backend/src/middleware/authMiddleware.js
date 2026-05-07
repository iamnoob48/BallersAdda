import jwt from 'jsonwebtoken';
import prisma from '../prismaClient.js';

const VALID_ROLES = new Set(['PLAYER', 'ACADEMY', 'COACH', 'SCOUT', 'ADMIN', 'ORGANIZER']);

export const verifyAccessToken = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No access token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET);

    if (!decoded.id || !VALID_ROLES.has(decoded.role)) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' });
    }
    return res.status(403).json({ message: 'Invalid access token' });
  }
};

// For sensitive routes — DB-checks tokenVersion so revocation is instant,
// not delayed by the 15min access token window.
export const verifyAccessTokenStrict = async (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No access token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET);

    if (!decoded.id || !VALID_ROLES.has(decoded.role)) {
      return res.status(401).json({ message: 'Invalid access token' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { tokenVersion: true, status: true },
    });

    if (!user || user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is suspended or deleted' });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      return res.status(401).json({ message: 'Session revoked, please log in again' });
    }

    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' });
    }
    return res.status(403).json({ message: 'Invalid access token' });
  }
};

export const isCoach = (req, res, next) => {
  if (!req.user?.id) return res.status(401).json({ message: 'Unauthorized' });
  if (req.user.role !== 'COACH') return res.status(403).json({ message: 'Forbidden: Requires Coach access' });
  next();
};
