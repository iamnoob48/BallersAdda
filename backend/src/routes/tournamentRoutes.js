import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import { getAllTournaments } from '../controllers/tournamentsController.js';

const router = express.Router();

// GET /tournament/all — paginated list with optional filters
router.get('/all', verifyAccessToken, getAllTournaments);

export default router;
