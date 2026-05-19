import rateLimit, { ipKeyGenerator } from 'express-rate-limit';
import { RedisStore } from 'rate-limit-redis';
import redis from '../config/redisClient.js';

const makeStore = (prefix) =>
  new RedisStore({
    sendCommand: (...args) => redis.call(...args),
    prefix: `rl:${prefix}:`,
  });

const baseOpts = {
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many requests, please try again later.' },
};

export const checkEmailLimiter = rateLimit({
  ...baseOpts,
  store: makeStore('checkEmail'),
  windowMs: 15 * 60 * 1000,
  max: 20,
});
