import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../config/redisClient.js';

const makeStore = (prefix) =>
  new RedisStore({
    // ioredis uses sendCommand(...args)
    sendCommand: (...args) => redis.call(...args),
    prefix: `rl:${prefix}:`,
  });

const baseOpts = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
};

export const loginLimiter = rateLimit({
  ...baseOpts,
  store: makeStore('login'),
  windowMs: 15 * 60 * 1000,
  max: 5,
  // Two-layer key: per-IP and per-email so rotating IPs can't bypass per-account limit
  // and a single bad NAT IP can't lock out all users on that network.
  keyGenerator: (req) => {
    const email = (req.body?.email || '').toLowerCase().trim();
    return `${ipKeyGenerator(req)}:${email}`;
  },
});

export const registerLimiter = rateLimit({
  ...baseOpts,
  store: makeStore('register'),
  windowMs: 60 * 60 * 1000,
  max: 3,
});

export const refreshLimiter = rateLimit({
  ...baseOpts,
  store: makeStore('refresh'),
  windowMs: 15 * 60 * 1000,
  max: 10,
});

export const checkEmailLimiter = rateLimit({
  ...baseOpts,
  store: makeStore('checkEmail'),
  windowMs: 15 * 60 * 1000,
  max: 20,
});

export const verifyEmailLimiter = rateLimit({
  ...baseOpts,
  store: makeStore('verifyEmail'),
  windowMs: 15 * 60 * 1000,
  max: 3,
});

export const resendVerificationLimiter = rateLimit({
  ...baseOpts,
  store: makeStore('resendVerification'),
  windowMs: 60 * 60 * 1000,
  max: 3,
});
