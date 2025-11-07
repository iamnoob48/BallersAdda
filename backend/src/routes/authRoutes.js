import express from 'express';
import { registerUser, loginUser, googleAuthCallback, verifyAccessToken,  getUserProfile, refreshAccessToken, logoutUser} from '../controllers/authControllers.js';
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
    failureRedirect: 'http::localhost:5173/Login',
    session: false
}), googleAuthCallback);

//For verify token route
router.get('/verify-token', verifyAccessToken, (req, res)=>{
    res.status(200).json({message: 'Access token is valid', user: req.user});
})

//For getting the profile picture
router.get('/profile', verifyAccessToken, getUserProfile)

//For refreshing the access token
router.post('/refresh-token', refreshAccessToken)

//For logout route
router.post('/logout',logoutUser)

export default router;