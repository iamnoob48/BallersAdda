import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import { getAllTournaments, getTournamentById } from '../controllers/tournamentsController.js';

const router = express.Router();

// GET /tournament/all — paginated list with optional filters
router.get('/all', verifyAccessToken, getAllTournaments);
router.get('/:id', verifyAccessToken, getTournamentById);

export default router;
