import express from 'express';
import { verifyAccessToken } from '../controllers/authControllers.js';
import { getPlayerProfile, enterPlayerProfile, updatePlayerProfile } from '../controllers/playerController.js';




const router = express.Router();

// For fetching the player profile of the user
router.get('/playerProfile', verifyAccessToken, getPlayerProfile);

//For creating player profile 
router.post('/createPlayerProfile',verifyAccessToken, enterPlayerProfile);

//Route for updating player profile can be added here in future
router.post('/updatePlayerProfile',verifyAccessToken, updatePlayerProfile);



export default router;
