import express from 'express';
import { registerUser, loginUser, googleAuthCallback, verifyUser, getUserProfile, refreshAccessToken, logoutUser, checkEmail } from '../controllers/authControllers.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import cookieParser from 'cookie-parser';
import passport from 'passport';

const router = express.Router();
router.use(cookieParser());

//For registering the user
router.post('/register', registerUser);

//For login route
router.post('/login', loginUser)

//For google route
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

//For google callback route when authenticated
router.get('/google/callback', passport.authenticate('google', {
    failureRedirect: 'http://localhost:5173/Login',
    session: false
}), googleAuthCallback);

//For verify token route
router.get('/verify-token', verifyAccessToken, verifyUser)

//For getting the profile picture
router.get('/profile', verifyAccessToken, getUserProfile)

//For refreshing the access token
router.post('/refresh-token', refreshAccessToken)

//For logout route
router.post('/logout', logoutUser)

//For checking username existence
router.get('/check-email/:email', checkEmail);

export default router;