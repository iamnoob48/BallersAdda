import crypto from 'crypto';
import razorpay from '../config/razorpayClient.js';
import prisma from '../prismaClient.js';
import { cacheDel, cacheInvalidate } from '../config/cacheUtils.js';
import { processEvent } from '../lib/gamificationService.js';

function safeCompareHex(a, b) {
  const bufA = Buffer.from(a, 'hex');
  const bufB = Buffer.from(b, 'hex');
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const ACADEMY_COMMISSION_RATE = parseFloat(process.env.PLATFORM_COMMISSION_RATE || '0.07');
const TOURNAMENT_COMMISSION_RATE = parseFloat(process.env.TOURNAMENT_COMMISSION_RATE || '0.05');

export const createAcademyOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { academyId, planId, batchId } = req.body;

    if (!academyId || !planId) {
      return res.status(400).json({ message: 'academyId and planId are required' });
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true, academyId: true },
    });

    if (!playerProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    if (playerProfile.academyId) {
      return res.status(400).json({ message: 'You must leave your current academy before joining a new one.' });
    }

    const academy = await prisma.academy.findUnique({
      where: { id: academyId },
      select: { id: true, name: true },
    });

    if (!academy) {
      return res.status(404).json({ message: 'Academy not found' });
    }

    const plan = await prisma.academyPlan.findUnique({
      where: { id: planId },
      select: { id: true, title: true, priceCents: true, academyId: true, active: true },
    });

    if (!plan || plan.academyId !== academyId) {
      return res.status(404).json({ message: 'Plan not found for this academy' });
    }

    if (!plan.active) {
      return res.status(400).json({ message: 'This plan is no longer available' });
    }

    if (batchId) {
      const batch = await prisma.academyBatch.findUnique({
        where: { id: batchId },
        select: { id: true, academyId: true, isActive: true, capacity: true, _count: { select: { players: true } } },
      });

      if (!batch || batch.academyId !== academyId) {
        return res.status(404).json({ message: 'Batch not found for this academy' });
      }

      if (!batch.isActive) {
        return res.status(400).json({ message: 'This batch is no longer active' });
      }

      if (batch._count.players >= batch.capacity) {
        return res.status(400).json({ message: 'This batch is full' });
      }
    }

    const platformCommissionCents = Math.round(plan.priceCents * ACADEMY_COMMISSION_RATE);
    const payoutAmountCents = plan.priceCents - platformCommissionCents;

    const receipt = `acad_${academyId}_${playerProfile.id}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: plan.priceCents,
      currency: 'INR',
      receipt,
    });

    await prisma.paymentTransaction.create({
      data: {
        razorpayOrderId: order.id,
        amountCents: plan.priceCents,
        platformCommissionCents,
        payoutAmountCents,
        type: 'ACADEMY_MEMBERSHIP',
        status: 'CREATED',
        paymentMethod: 'ONLINE',
        userId,
        academyId,
        planId,
        batchId: batchId || null,
        receipt,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true, phone: true },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: plan.priceCents,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      academy: { id: academy.id, name: academy.name },
      plan: { id: plan.id, title: plan.title, priceCents: plan.priceCents },
      prefill: {
        name: user.username || '',
        email: user.email || '',
        contact: user.phone || '',
      },
    });
  } catch (error) {
    console.error('Error creating academy order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const verifyAcademyPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeCompareHex(expectedSignature, razorpay_signature)) {
      return res.status(400).json({ message: 'Payment signature verification failed' });
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (transaction.status === 'CAPTURED') {
      return res.status(200).json({ message: 'Payment already verified', transactionId: transaction.id });
    }

    if (transaction.status !== 'CREATED') {
      return res.status(400).json({ message: `Cannot verify transaction with status: ${transaction.status}` });
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true, academyId: true },
    });

    if (!playerProfile) {
      return res.status(404).json({ message: 'Player profile not found' });
    }

    if (playerProfile.academyId) {
      await prisma.paymentTransaction.update({
        where: { id: transaction.id },
        data: { status: 'FAILED', failureReason: 'Player already in an academy' },
      });
      return res.status(400).json({ message: 'You are already in an academy' });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedTransaction = await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'CAPTURED',
        },
      });

      const updatedPlayer = await tx.playerProfile.update({
        where: { userId },
        data: {
          academyId: transaction.academyId,
          batchId: transaction.batchId,
        },
      });

      const enrollment = await tx.academyEnrollment.create({
        data: {
          playerId: playerProfile.id,
          academyId: transaction.academyId,
          batchId: transaction.batchId,
          planId: transaction.planId,
          status: 'ACTIVE',
        },
      });

      await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: { enrollmentId: enrollment.id },
      });

      await tx.academy.update({
        where: { id: transaction.academyId },
        data: { noOfStudents: { increment: 1 } },
      });

      return { updatedTransaction, updatedPlayer, enrollment };
    });

    cacheDel(`academy:detail:${transaction.academyId}`);
    cacheInvalidate(`academy:list:*`);

    processEvent('ACADEMY_JOIN', playerProfile.id).catch(err =>
      console.error(`gamification error (ACADEMY_JOIN, player ${playerProfile.id}):`, err.message)
    );

    return res.status(200).json({
      message: 'Payment verified and enrollment complete',
      transactionId: result.updatedTransaction.id,
      enrollment: {
        id: result.enrollment.id,
        status: result.enrollment.status,
      },
    });
  } catch (error) {
    console.error('Error verifying academy payment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (!signature || !webhookSecret) {
      return res.status(400).json({ message: 'Missing signature or webhook secret' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.rawBody)
      .digest('hex');

    if (!safeCompareHex(expectedSignature, signature)) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    const event = req.body;
    const eventId = req.headers['x-razorpay-event-id'];

    if (eventId) {
      const existing = await prisma.paymentTransaction.findUnique({
        where: { webhookEventId: eventId },
      });
      if (existing) {
        return res.status(200).json({ message: 'Duplicate event, already processed' });
      }
    }

    const eventType = event.event;
    const payload = event.payload;

    if (eventType === 'payment.captured') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      const transaction = await prisma.paymentTransaction.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (transaction && transaction.status === 'CREATED') {
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            razorpayPaymentId: payment.id,
            status: 'CAPTURED',
            webhookEventId: eventId || null,
          },
        });
      }
    }

    if (eventType === 'payment.failed') {
      const payment = payload.payment.entity;
      const orderId = payment.order_id;

      const transaction = await prisma.paymentTransaction.findUnique({
        where: { razorpayOrderId: orderId },
      });

      if (transaction && transaction.status === 'CREATED') {
        await prisma.paymentTransaction.update({
          where: { id: transaction.id },
          data: {
            status: 'FAILED',
            failureReason: payment.error_description || 'Payment failed',
            webhookEventId: eventId || null,
          },
        });
      }
    }

    return res.status(200).json({ message: 'Webhook processed' });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(200).json({ message: 'Webhook received' });
  }
};

export const createTournamentOrder = async (req, res) => {
  try {
    const userId = req.user.id;
    const { tournamentId, teamId } = req.body;

    if (!tournamentId || !teamId) {
      return res.status(400).json({ message: 'tournamentId and teamId are required' });
    }

    const tournament = await prisma.tournament.findUnique({
      where: { id: tournamentId },
      select: { id: true, name: true, registrationFeeCents: true, status: true },
    });

    if (!tournament) {
      return res.status(404).json({ message: 'Tournament not found' });
    }

    if (!tournament.registrationFeeCents || tournament.registrationFeeCents <= 0) {
      return res.status(400).json({ message: 'This tournament has no registration fee' });
    }

    if (tournament.status !== 'UPCOMING') {
      return res.status(400).json({ message: 'Tournament registration is closed' });
    }

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      select: { id: true, captainId: true, tournamentId: true, status: true, _count: { select: { players: true } } },
    });

    if (!team || team.tournamentId !== tournamentId) {
      return res.status(404).json({ message: 'Team not found for this tournament' });
    }

    if (team.captainId !== userId) {
      return res.status(403).json({ message: 'Only the team captain can pay the registration fee' });
    }

    if (team.status === 'APPROVED') {
      return res.status(400).json({ message: 'This team is already registered' });
    }

    const MIN_PLAYERS = 5;
    if (team._count.players < MIN_PLAYERS) {
      return res.status(400).json({ message: `Your squad needs at least ${MIN_PLAYERS} players before you can pay.` });
    }

    const existingPayment = await prisma.paymentTransaction.findFirst({
      where: { tournamentId, teamId, type: 'TOURNAMENT_REGISTRATION', status: 'CAPTURED' },
    });

    if (existingPayment) {
      return res.status(400).json({ message: 'Registration fee already paid for this team' });
    }

    const feeCents = tournament.registrationFeeCents;
    const platformCommissionCents = Math.round(feeCents * TOURNAMENT_COMMISSION_RATE);
    const payoutAmountCents = feeCents - platformCommissionCents;

    const receipt = `tourn_${tournamentId}_${teamId}_${Date.now()}`;

    const order = await razorpay.orders.create({
      amount: feeCents,
      currency: 'INR',
      receipt,
    });

    await prisma.paymentTransaction.create({
      data: {
        razorpayOrderId: order.id,
        amountCents: feeCents,
        platformCommissionCents,
        payoutAmountCents,
        type: 'TOURNAMENT_REGISTRATION',
        status: 'CREATED',
        paymentMethod: 'ONLINE',
        userId,
        tournamentId,
        teamId,
        receipt,
      },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, username: true, phone: true },
    });

    return res.status(200).json({
      orderId: order.id,
      amount: feeCents,
      currency: 'INR',
      keyId: process.env.RAZORPAY_KEY_ID,
      tournament: { id: tournament.id, name: tournament.name },
      prefill: {
        name: user.username || '',
        email: user.email || '',
        contact: user.phone || '',
      },
    });
  } catch (error) {
    console.error('Error creating tournament order:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};

export const verifyTournamentPayment = async (req, res) => {
  try {
    const userId = req.user.id;
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ message: 'Missing payment verification fields' });
    }

    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (!safeCompareHex(expectedSignature, razorpay_signature)) {
      return res.status(400).json({ message: 'Payment signature verification failed' });
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
    });

    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }

    if (transaction.userId !== userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    if (transaction.status === 'CAPTURED') {
      return res.status(200).json({ message: 'Payment already verified', transactionId: transaction.id });
    }

    if (transaction.status !== 'CREATED') {
      return res.status(400).json({ message: `Cannot verify transaction with status: ${transaction.status}` });
    }

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      const txn = await tx.paymentTransaction.update({
        where: { id: transaction.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          status: 'CAPTURED',
        },
      });

      if (txn.teamId) {
        await tx.team.update({
          where: { id: txn.teamId },
          data: { status: 'APPROVED' },
        });
      }

      return txn;
    });

    if (updatedTransaction.tournamentId) {
      cacheInvalidate(`tournaments:*`).catch(() => {});
    }

    const playerProfile = await prisma.playerProfile.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (playerProfile) {
      processEvent('TOURNAMENT_PAYMENT', playerProfile.id).catch(err =>
        console.error(`gamification error (TOURNAMENT_PAYMENT, player ${playerProfile.id}):`, err.message)
      );
    }

    return res.status(200).json({
      message: 'Tournament payment verified',
      transactionId: updatedTransaction.id,
      teamStatus: 'APPROVED',
    });
  } catch (error) {
    console.error('Error verifying tournament payment:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};
