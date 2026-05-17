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
  sendSignupInvite,
  getTeamQueue,
  confirmFreeRegistration,
  removePlayerFromTeam,
  addPlayerToTeam,
  getOrCreateInviteLink,
  disbandTeam,
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

// Team queue & confirmation (invite link flow)
router.get('/team/:teamId/queue', verifyAccessToken, getTeamQueue);
router.post('/team/:teamId/confirm', verifyAccessToken, confirmFreeRegistration);

// Manage team (captain only)
router.delete('/team/:teamId/player/:playerId', verifyAccessToken, removePlayerFromTeam);
router.post('/team/:teamId/add-player', verifyAccessToken, addPlayerToTeam);
router.get('/team/:teamId/invite-link', verifyAccessToken, getOrCreateInviteLink);
router.post('/team/:teamId/disband', verifyAccessToken, disbandTeam);

// POST endpoints for independent team roster mapping and generation
router.post('/verify-players', verifyAccessToken, verifyRosterPlayers);
router.post('/send-signup-invite', verifyAccessToken, sendSignupInvite);
router.post('/:id/registerTeam', verifyAccessToken, registerTeam);

// Single tournament detail — keep last so /invite/... is never swallowed by /:id
router.get('/:id', verifyAccessToken, getTournamentById);

export default router;
