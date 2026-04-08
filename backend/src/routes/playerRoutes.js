import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import { getPlayerProfile, enterPlayerProfile, updatePlayerProfile, getAcademyDetailsOfPlayer } from '../controllers/playerController.js';




const router = express.Router();

// For fetching the player profile of the user
router.get('/playerProfile', verifyAccessToken, getPlayerProfile);

//For creating player profile 
router.post('/createPlayerProfile', verifyAccessToken, enterPlayerProfile);

//Route for updating player profile can be added here in future
router.post('/updatePlayerProfile', verifyAccessToken, updatePlayerProfile);

//Route for fetching academy details of player based on academy id
router.get('/academyDetailsOfPlayer', verifyAccessToken, getAcademyDetailsOfPlayer);



export default router;
