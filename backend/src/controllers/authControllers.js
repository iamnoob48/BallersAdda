import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient.js';

// ── Cookie options (DRY helper) ─────────────────────────────────────────
const isProduction = process.env.NODE_ENV === 'production';

const accessCookieOpts = {
  httpOnly: true,
  secure: isProduction,           // false in dev so cookies work on http://localhost
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge: 15 * 60 * 1000,        // 15 minutes
};

const refreshCookieOpts = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? 'strict' : 'lax',
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

// ── Token generators ────────────────────────────────────────────────────
const generateAccessToken = (user) =>
  jwt.sign({ id: user.id }, process.env.ACCESS_TOKEN_JWT_SECRET, { expiresIn: '15m' });

const generateRefreshToken = (user) =>
  jwt.sign({ id: user.id }, process.env.REFRESH_TOKEN_JWT_SECRET, { expiresIn: '7d' });

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

    // --- Input validation ---
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }
    if (!EMAIL_RE.test(email)) {
      return res.status(400).json({ message: 'Invalid email format' });
    }
    if (password.length < 8) {
      return res.status(400).json({ message: 'Password must be at least 8 characters' });
    }

    // Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }

    // Hash & create
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: { username: username || null, email, password: hashedPassword },
    });

    setAuthCookies(res, newUser);
    return res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Register error:', error);
    // Handle Prisma unique‑constraint race condition
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

    // --- Input validation ---
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // User not found OR is a Google-only account (no password)
    if (!user || !user.password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check account status
    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ message: 'Account is suspended or deleted' });
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    setAuthCookies(res, user);

    // Update lastLogin timestamp (fire‑and‑forget)
    prisma.user.update({ where: { id: user.id }, data: { lastLogin: new Date() } }).catch(() => { });

    // Never leak the password hash to the client
    const { password: _pw, ...safeUser } = user;
    return res.status(200).json({ message: 'User logged in successfully', user: safeUser });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

// =====================================================================
//  POST /auth/refresh-token
// =====================================================================
export const refreshAccessToken = (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  if (!refreshToken) {
    return res.status(401).json({ message: 'No refresh token provided' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_JWT_SECRET);
    const newAccessToken = generateAccessToken(decoded);
    res.cookie('accessToken', newAccessToken, accessCookieOpts);
    return res.status(200).json({ message: 'Access token refreshed successfully' });
  } catch (error) {
    // Distinguish expired vs malformed tokens
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Refresh token expired, please log in again' });
    }
    return res.status(403).json({ message: 'Invalid refresh token' });
  }
};

// =====================================================================
//  Google OAuth callback
// =====================================================================
export const googleAuthCallback = (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.redirect(`${process.env.CLIENT_URL || 'http://localhost:5173'}/Login?error=auth_failed`);
    }

    setAuthCookies(res, user);
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

    return res.status(200).json({ success: true, user });
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
    // req.user is already set by the verifyAccessToken middleware — no need to re‑decode
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
//  POST /auth/logout
// =====================================================================
export const logoutUser = (_req, res) => {
  res.clearCookie('accessToken', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'strict' : 'lax' });
  res.clearCookie('refreshToken', { httpOnly: true, secure: isProduction, sameSite: isProduction ? 'strict' : 'lax' });
  return res.status(200).json({ message: 'User logged out successfully' });
};

// =====================================================================
//  GET /auth/check-username/:username
// =====================================================================
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.params;
    if (!email) return res.status(400).json({ valid: false, message: "Email required" });

    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
      select: { id: true, email: true, role: true, profilePic: true },
    });

    if (user) {
      return res.status(200).json({ exists: true, user: { id: user.id, email: user.email, role: user.role, profilePic: user.profilePic } });
    } else {
      return res.status(404).json({ exists: false, message: "Email not found" });
    }
  } catch (error) {
    console.error("Error checking email:", error);
    return res.status(500).json({ valid: false, message: "Server error" });
  }
};
