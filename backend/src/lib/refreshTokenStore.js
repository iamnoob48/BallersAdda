import redis from '../config/redisClient.js';

const TTL = 7 * 24 * 60 * 60; // seconds

export const storeRefreshToken = (jti, userId) =>
  redis.set(`refresh:${jti}`, String(userId), 'EX', TTL);

// Atomically read + delete. Returns userId string if valid, null if missing/already consumed.
export const consumeRefreshToken = (jti) =>
  redis.getdel(`refresh:${jti}`);

export const deleteRefreshToken = (jti) =>
  redis.del(`refresh:${jti}`);
