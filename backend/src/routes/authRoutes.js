import express from 'express';
import {
    registerUser,
    loginUser,
    googleAuthCallback,
    exchangeOAuthCode,
    verifyUser,
    getUserProfile,
    refreshAccessToken,
    logoutUser,
    checkEmail,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
} from '../controllers/authControllers.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import {
    loginLimiter,
    registerLimiter,
    refreshLimiter,
    checkEmailLimiter,
    verifyEmailLimiter,
    resendVerificationLimiter,
    forgotPasswordLimiter,
    resetPasswordLimiter,
} from '../middleware/rateLimiters.js';
import passport from 'passport';

const router = express.Router();


// Register
router.post('/register', registerLimiter, registerUser);

// Login
router.post('/login', loginLimiter, loginUser);

// Google OAuth
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
    '/google/callback',
    passport.authenticate('google', {
        failureRedirect: `${process.env.CLIENT_URL || 'http://localhost:5173'}/Login`,
        session: false,
    }),
    googleAuthCallback
);

// Exchange OAuth code for tokens (Safari ITP fallback)
router.post('/exchange-oauth-code', loginLimiter, exchangeOAuthCode);

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

// Email verification
router.get('/verify-email', verifyEmailLimiter, verifyEmail);
router.post('/resend-verification', verifyAccessToken, resendVerificationLimiter, resendVerification);

// Password reset
router.post('/forgot-password', forgotPasswordLimiter, forgotPassword);
router.post('/reset-password', resetPasswordLimiter, resetPassword);

export default router;
