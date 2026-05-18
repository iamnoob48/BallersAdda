import redis from '../config/redisClient.js';

const TTL = 60; // seconds

export const storeOAuthCode = (code, userId) =>
  redis.set(`oauth_code:${code}`, String(userId), 'EX', TTL);

export const consumeOAuthCode = (code) =>
  redis.getdel(`oauth_code:${code}`);
