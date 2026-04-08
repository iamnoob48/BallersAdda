import jwt from 'jsonwebtoken';

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