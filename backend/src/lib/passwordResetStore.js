import { createHash, randomBytes } from 'crypto';
import redis from '../config/redisClient.js';

const TTL = 60 * 60; // 1 hour

const hash = (token) => createHash('sha256').update(token).digest('hex');

export const generateResetToken = () => randomBytes(32).toString('hex');

export const storeResetToken = (rawToken, userId) =>
  redis.set(`pw-reset:${hash(rawToken)}`, String(userId), 'EX', TTL);

// Atomically consume — returns userId string or null if expired/used
export const consumeResetToken = (rawToken) =>
  redis.getdel(`pw-reset:${hash(rawToken)}`);
