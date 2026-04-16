import rateLimit from 'express-rate-limit';
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
