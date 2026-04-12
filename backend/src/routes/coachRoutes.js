import express from 'express';
import { getCoachProfile, updateCoachProfile, getAcademyRoster, createTeam } from '../controllers/coachControllers.js';
import { verifyAccessToken, isCoach } from '../middleware/authMiddleware.js';

const router = express.Router();

// Apply verifyAccessToken globally to all coach routes
router.use(verifyAccessToken);

// Coach Profile
router.get('/profile', getCoachProfile);
router.put('/profile', updateCoachProfile); // No need for isCoach yet if they are setting up the profile! Or actually verifyAccessToken brings req.user

// Roster & Teams
router.get('/roster', isCoach, getAcademyRoster);
router.post('/teams', isCoach, createTeam);

export default router;
