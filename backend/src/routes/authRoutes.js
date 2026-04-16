import express from 'express';
import {
    registerUser,
    loginUser,
    googleAuthCallback,
    verifyUser,
    getUserProfile,
    refreshAccessToken,
    logoutUser,
    checkEmail,
} from '../controllers/authControllers.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import { requireCsrfHeader } from '../middleware/csrfMiddleware.js';
import {
    loginLimiter,
    registerLimiter,
    refreshLimiter,
    checkEmailLimiter,
} from '../middleware/rateLimiters.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';

const router = express.Router();
router.use(cookieParser());

// CSRF guard for all state-changing auth routes
router.use(requireCsrfHeader);

// Register
router.post('/register', registerLimiter, registerUser);

// Login
router.post('/login', loginLimiter, loginUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: 'http://localhost:5173/Login',
        session: false,
    }),
    googleAuthCallback
);

// Verify token
router.get('/verify-token', verifyAccessToken, verifyUser);

// Profile
router.get('/profile', verifyAccessToken, getUserProfile);

// Refresh token (with rotation)
router.post('/refresh-token', refreshLimiter, refreshAccessToken);

// Logout — must be authed so we can bump tokenVersion
router.post('/logout', verifyAccessToken, logoutUser);

// Check email — authed + rate-limited; returns only { exists }
router.get('/check-email/:email', verifyAccessToken, checkEmailLimiter, checkEmail);

export default router;
