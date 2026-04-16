import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';

// ── Cookie options (DRY helper) ─────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const accessCookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000,        // 15 minutes
};

const refreshCookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// Same options used for clearing — must match for the browser to drop the cookie
const clearCookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  path: '/',
};

// ── Token generators ────────────────────────────────────────────────────
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.tokenVersion ?? 0 },
    process.env.ACCESS_TOKEN_JWT_SECRET,
    { expiresIn: '15m' }
  );

const generateRefreshToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.tokenVersion ?? 0 },
    process.env.REFRESH_TOKEN_JWT_SECRET,
    { expiresIn: '7d' }
  );

// Helper: set both cookies on a response
export const setAuthCookies = (res, user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  res.cookie('accessToken', accessToken, accessCookieOpts);
  res.cookie('refreshToken', refreshToken, refreshCookieOpts);
  return { accessToken, refreshToken };
};

// ── Email validation helper ─────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// =====================================================================
//  POST /auth/register
// =====================================================================
export const registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username: username || null, email, password: hashedPassword },
    });

    setAuthCookies(res, newUser);
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'User already exists' });
    }
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  POST /auth/login
// =====================================================================
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is suspended or deleted' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    setAuthCookies(res, user);

    prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }).catch(() => { });

    const { password: _pw, ...safeUser } = user;
    return res.status(200).json({ message: 'User logged in successfully', user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  POST /auth/refresh-token
//  Rotates BOTH tokens, re-verifies user status, and checks tokenVersion.
// =====================================================================
export const refreshAccessToken = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_JWT_SECRET);

    // Re-fetch user from DB — source of truth for status + tokenVersion
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, role: true, status: true, tokenVersion: true },
    });

    if (!user) {
      res.clearCookie('accessToken', clearCookieOpts);
      res.clearCookie('refreshToken', clearCookieOpts);
      return res.status(401).json({ message: 'User no longer exists' });
    }

    if (user.status !== 'ACTIVE') {
      res.clearCookie('accessToken', clearCookieOpts);
      res.clearCookie('refreshToken', clearCookieOpts);
      return res.status(403).json({ message: 'Account is suspended or deleted' });
    }

    if (decoded.tokenVersion !== user.tokenVersion) {
      // Token reuse / revoked — clear cookies and force re-login
      res.clearCookie('accessToken', clearCookieOpts);
      res.clearCookie('refreshToken', clearCookieOpts);
      return res.status(401).json({ message: 'Refresh token has been revoked' });
    }

    // Rotate BOTH tokens
    setAuthCookies(res, user);
    return res.status(200).json({ message: 'Tokens refreshed successfully' });
  } catch (error) {
    res.clearCookie('accessToken', clearCookieOpts);
    res.clearCookie('refreshToken', clearCookieOpts);
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired, please log in again' });
    }
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// =====================================================================
//  Google OAuth callback
// =====================================================================
export const googleAuthCallback = async (req, res) => {
  try {
    const passportUser = req.user;
    if (!passportUser) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/Login?error=auth_failed`);
    }

    // Ensure we have a current tokenVersion from DB
    const user = await prisma.user.findUnique({
      where: { id: passportUser.id },
      select: { id: true, role: true, tokenVersion: true },
    });

    setAuthCookies(res, user || passportUser);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/auth/success`);
  } catch (error) {
    console.error('Google callback error:', error);
    res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/Login?error=server_error`);
  }
};

// =====================================================================
//  GET /auth/verify-token  (behind verifyAccessToken middleware)
// =====================================================================
export const verifyUser = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, profilePic: true, username: true, role: true, status: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is suspended or deleted' });
    }

    let isCoachProfileIncomplete = false;
    if (user.role === 'COACH') {
      const coach = await prisma.coach.findUnique({ where: { userId: user.id } });
      if (coach && coach.firstName === 'Pending') {
        isCoachProfileIncomplete = true;
      }
    }

    return res.status(200).json({ success: true, user, isCoachProfileIncomplete });
  } catch (error) {
    console.error('Verify user error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  GET /auth/profile  (behind verifyAccessToken middleware)
// =====================================================================
export const getUserProfile = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { profilePic: true, username: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  POST /auth/logout (behind verifyAccessToken middleware)
//  Server-side invalidation: bump tokenVersion so all outstanding
//  refresh tokens for this user are immediately invalid.
// =====================================================================
export const logoutUser = async (req, res) => {
  try {
    if (req.user?.id) {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { tokenVersion: { increment: 1 } },
      }).catch((e) => console.error('Failed to bump tokenVersion on logout:', e));
    }
  } finally {
    res.clearCookie('accessToken', clearCookieOpts);
    res.clearCookie('refreshToken', clearCookieOpts);
    return res.status(200).json({ message: 'User logged out successfully' });
  }
};

// =====================================================================
//  GET /auth/check-email/:email  (AUTHED — behind verifyAccessToken)
//  Returns only { exists: boolean } to avoid user enumeration / PII leaks.
// =====================================================================
export const checkEmail = async (req, res) => {
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
};
