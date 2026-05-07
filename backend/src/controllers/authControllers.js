import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import prisma from '../prismaClient.js';
import { storeRefreshToken, consumeRefreshToken, deleteRefreshToken } from '../lib/refreshTokenStore.js';
import { generateVerificationToken, storeVerificationToken, consumeVerificationToken } from '../lib/emailVerificationStore.js';
import { sendVerificationEmail } from '../lib/mailer.js';

// ── Cookie options ──────────────────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const accessCookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  path: '/',
  maxAge: 15 * 60 * 1000,
};

const refreshCookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  path: '/',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const clearCookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  path: '/',
  maxAge: 0,
};

// ── Token generators ────────────────────────────────────────────────────
const generateAccessToken = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.tokenVersion ?? 0 },
    process.env.ACCESS_TOKEN_JWT_SECRET,
    { expiresIn: '15m' }
  );

const generateRefreshToken = (user, jti) =>
  jwt.sign(
    { id: user.id, role: user.role, tokenVersion: user.tokenVersion ?? 0, jti },
    process.env.REFRESH_TOKEN_JWT_SECRET,
    { expiresIn: '7d' }
  );

// Issues both tokens and stores the refresh jti in Redis.
export const setAuthCookies = async (res, user) => {
  const jti = randomUUID();
  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user, jti);
  res.cookie('accessToken', accessToken, accessCookieOpts);
  res.cookie('refreshToken', refreshToken, refreshCookieOpts);
  await storeRefreshToken(jti, user.id);
  return { accessToken, refreshToken };
};

// ── Email validation ────────────────────────────────────────────────────
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ALLOWED_DOMAINS = new Set([
  'gmail.com', 'googlemail.com',
  'outlook.com', 'hotmail.com', 'hotmail.in', 'live.com', 'msn.com',
  'yahoo.com', 'yahoo.in', 'yahoo.co.in', 'yahoo.co.uk',
  'icloud.com', 'me.com', 'mac.com',
  'proton.me', 'protonmail.com',
  'rediffmail.com',
  'aol.com',
  'zoho.com',
]);

const isAllowedEmailDomain = (email) => {
  const domain = email.split('@')[1]?.toLowerCase();
  return domain && ALLOWED_DOMAINS.has(domain);
};

// =====================================================================
//  POST /auth/register
// =====================================================================
export const registerUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (!isAllowedEmailDomain(email)) {
      return res.status(400).json({ message: 'Please use a valid email provider (Gmail, Outlook, Yahoo, etc.)' });
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

    await setAuthCookies(res, newUser);

    // Send verification email — fire and forget, don't block registration response
    const rawToken = generateVerificationToken();
    storeVerificationToken(rawToken, newUser.id)
      .then(() => sendVerificationEmail(email, rawToken))
      .catch((e) => console.error('Failed to send verification email:', e));

    return res.status(201).json({ message: 'User registered successfully. Check your email to verify your account.', rawToken });
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
    const { password } = req.body;
    const email = req.body.email?.toLowerCase().trim();

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!isAllowedEmailDomain(email)) {
      return res.status(400).json({ message: 'Please use a valid email provider (Gmail, Outlook, Yahoo, etc.)' });
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

    await setAuthCookies(res, user);

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
//  JTI-based atomic rotation with reuse detection.
//  GETDEL ensures only one concurrent request can consume a given jti.
//  If jti is missing from Redis → already consumed → potential theft →
//  bump tokenVersion to invalidate all sessions.
// =====================================================================
export const refreshAccessToken = async (req, res) => {
  const token = req.cookies?.refreshToken;
  if (!token) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_JWT_SECRET);
    const { id, jti } = decoded;

    if (!jti) {
      res.clearCookie('accessToken', clearCookieOpts);
      res.clearCookie('refreshToken', clearCookieOpts);
      return res.status(401).json({ message: 'Invalid refresh token, please log in again' });
    }

    // Atomically consume — only one concurrent request wins
    const storedUserId = await consumeRefreshToken(jti);

    if (!storedUserId) {
      // jti missing from Redis: either already rotated or stolen token reused
      // Nuclear response: revoke ALL sessions for this user
      await prisma.user.update({
        where: { id },
        data: { tokenVersion: { increment: 1 } },
      }).catch(() => { });
      res.clearCookie('accessToken', clearCookieOpts);
      res.clearCookie('refreshToken', clearCookieOpts);
      console.error(`[SECURITY] Refresh token reuse detected — userId: ${id}`);
      return res.status(401).json({ message: 'Session expired, please log in again' });
    }

    const user = await prisma.user.findUnique({
      where: { id },
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

    // tokenVersion as nuclear kill-switch (password change, admin revoke)
    if (decoded.tokenVersion !== user.tokenVersion) {
      res.clearCookie('accessToken', clearCookieOpts);
      res.clearCookie('refreshToken', clearCookieOpts);
      return res.status(401).json({ message: 'Session revoked, please log in again' });
    }

    await setAuthCookies(res, user);
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

    const user = await prisma.user.findUnique({
      where: { id: passportUser.id },
      select: { id: true, role: true, tokenVersion: true },
    });

    await setAuthCookies(res, user || passportUser);
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
//  Deletes the specific jti from Redis + bumps tokenVersion as kill-switch.
// =====================================================================
export const logoutUser = async (req, res) => {
  try {
    const token = req.cookies?.refreshToken;
    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_JWT_SECRET);
        if (decoded.jti) await deleteRefreshToken(decoded.jti);
      } catch (_) { }
    }

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

// =====================================================================
//  GET /auth/verify-email?token=...  (public)
//  Hashes incoming token, looks up Redis, marks user verified.
// =====================================================================
export const verifyEmail = async (req, res) => {
  const { token } = req.query;

  if (!token || typeof token !== 'string') {
    return res.status(400).json({ message: 'Verification token is required' });
  }

  try {
    const userId = await consumeVerificationToken(token);

    if (!userId) {
      return res.status(400).json({ message: 'Invalid or expired verification link' });
    }

    await prisma.user.update({
      where: { id: Number(userId) },
      data: { isVerified: true },
    });

    return res.status(200).json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('Verify email error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  POST /auth/resend-verification  (behind verifyAccessToken)
//  Always returns 200 — no enumeration possible.
// =====================================================================
export const resendVerification = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, isVerified: true },
    });

    if (!user) {
      return res.status(200).json({ message: 'If your account exists, a verification email has been sent' });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: 'Email is already verified' });
    }

    const rawToken = generateVerificationToken();
    await storeVerificationToken(rawToken, req.user.id);
    await sendVerificationEmail(user.email, rawToken);

    return res.status(200).json({ message: 'Verification email sent' });
  } catch (error) {
    console.error('Resend verification error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
