import jwt from 'jsonwebtoken';

import prisma from '../prismaClient.js';

/**
 * Middleware: verifies the JWT access token from cookies.
 * Sets req.user = { id } on success.
 */
export const verifyAccessToken = (req, res, next) => {
  const token = req.cookies?.accessToken;

  if (!token) {
    return res.status(401).json({ message: 'No access token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_JWT_SECRET);
    req.user = decoded; // { id, iat, exp }
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Access token expired' });
    }
    return res.status(403).json({ message: 'Invalid access token' });
  }
};


/**
 * Middleware: restrict route to COACH or ACADEMY role
 */
export const isCoach = async (req, res, next) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { role: true }
    });

    if (!user || (user.role !== 'COACH' && user.role !== 'ACADEMY')) {
      return res.status(403).json({ message: 'Forbidden: Requires Coach access' });
    }
    next();
  } catch (error) {
    console.error("Error in isCoach middleware:", error);
    res.status(500).json({ message: 'Server error' });
  }
};