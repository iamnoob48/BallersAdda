import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import {
  getAllTournaments,
  getTournamentById,
  verifyRosterPlayers,
  registerTeam,
  validateInviteToken,
  redeemInviteToken,
} from '../controllers/tournamentsController.js';

const router = express.Router();

// GET /tournament/all — paginated list with optional filters
router.get('/all', verifyAccessToken, getAllTournaments);

// ── Invite routes (must be declared before /:id to avoid param collision) ──
// Public: validates token, caches invite data in Redis, returns team info
router.get('/invite/validate', validateInviteToken);
// Auth: verifies email match then connects player to team
router.post('/invite/redeem', verifyAccessToken, redeemInviteToken);

// POST endpoints for independent team roster mapping and generation
router.post('/verify-players', verifyAccessToken, verifyRosterPlayers);
router.post('/:id/registerTeam', verifyAccessToken, registerTeam);

// Single tournament detail — keep last so /invite/... is never swallowed by /:id
router.get('/:id', verifyAccessToken, getTournamentById);

export default router;
