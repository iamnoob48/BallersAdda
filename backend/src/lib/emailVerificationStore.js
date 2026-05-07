import { createHash, randomBytes } from 'crypto';
import redis from '../config/redisClient.js';

const TTL = 24 * 60 * 60; // 24 hours in seconds

export const generateVerificationToken = () => randomBytes(32).toString('hex');

export const hashToken = (token) =>
  createHash('sha256').update(token).digest('hex');

export const storeVerificationToken = (rawToken, userId) =>
  redis.set(`email-verify:${hashToken(rawToken)}`, String(userId), 'EX', TTL);

// Atomically consume — returns userId string if valid, null if expired/already used
export const consumeVerificationToken = (rawToken) =>
  redis.getdel(`email-verify:${hashToken(rawToken)}`);
