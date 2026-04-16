import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import {
  getAllTournaments,
  getTournamentById,
  verifyRosterPlayers,
  registerTeam,
  validateInviteToken,
  redeemInviteToken,
  validateTeamLink,
  redeemTeamLink,
} from '../controllers/tournamentsController.js';

const router = express.Router();

// GET /tournament/all — paginated list with optional filters
router.get('/all', verifyAccessToken, getAllTournaments);

// ── Email invite routes ──
router.get('/invite/validate', validateInviteToken);
router.post('/invite/redeem', verifyAccessToken, redeemInviteToken);

// ── Generic shareable link routes ──
router.get('/team-link/validate', validateTeamLink);
router.post('/team-link/redeem', verifyAccessToken, redeemTeamLink);

// POST endpoints for independent team roster mapping and generation
router.post('/verify-players', verifyAccessToken, verifyRosterPlayers);
router.post('/:id/registerTeam', verifyAccessToken, registerTeam);

// Single tournament detail — keep last so /invite/... is never swallowed by /:id
router.get('/:id', verifyAccessToken, getTournamentById);

export default router;
