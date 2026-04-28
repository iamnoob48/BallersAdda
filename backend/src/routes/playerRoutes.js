import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import { getPlayerProfile, enterPlayerProfile, updatePlayerProfile, getAcademyDetailsOfPlayer, joinAcademy, getMyTournaments, getTeamHubData, getPlayerAcademyStats, getPlayerAttendance, leaveAcademy, getAcademyHistory, uploadProfilePic } from '../controllers/playerController.js';




const router = express.Router();

// For fetching the player profile of the user
router.get('/playerProfile', verifyAccessToken, getPlayerProfile);

//For creating player profile 
router.post('/createPlayerProfile', verifyAccessToken, enterPlayerProfile);

//Route for updating player profile can be added here in future
router.post('/updatePlayerProfile', verifyAccessToken, updatePlayerProfile);

//Route for fetching academy details of player based on academy id
router.get('/academyDetailsOfPlayer', verifyAccessToken, getAcademyDetailsOfPlayer);

//Route for a player to join academy
router.post('/joinAcademy', verifyAccessToken, joinAcademy);

// Fetch all tournaments the logged-in player is rostered for
router.get('/myTournaments', verifyAccessToken, getMyTournaments);

// Academy stats (PlayerAcademyStats row for current academy)
router.get('/academyStats', verifyAccessToken, getPlayerAcademyStats);

// Attendance summary — monthly count, recent form, streak
router.get('/attendance', verifyAccessToken, getPlayerAttendance);

// Team Hub / Locker Room — full data for a single team
router.get('/team-hub/:teamId', verifyAccessToken, getTeamHubData);

//Route for a player to leave academy
router.post('/leaveAcademy', verifyAccessToken, leaveAcademy);

// Full enrollment history (ACTIVE + FORMER) — used for academy overview + page access gate
router.get('/academyHistory', verifyAccessToken, getAcademyHistory);

// Upload / replace profile picture (base64 → Cloudinary)
router.post('/uploadProfilePic', verifyAccessToken, uploadProfilePic);

export default router;
