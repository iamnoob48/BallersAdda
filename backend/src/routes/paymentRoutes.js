import express from 'express';
import { verifyAccessToken } from '../middleware/authMiddleware.js';
import { createAcademyOrder, verifyAcademyPayment, createTournamentOrder, verifyTournamentPayment, handleWebhook } from '../controllers/paymentController.js';

const router = express.Router();

router.post('/academy/order', verifyAccessToken, createAcademyOrder);
router.post('/academy/verify', verifyAccessToken, verifyAcademyPayment);
router.post('/tournament/order', verifyAccessToken, createTournamentOrder);
router.post('/tournament/verify', verifyAccessToken, verifyTournamentPayment);
router.post('/webhook', handleWebhook);

export default router;
