import redis from "./redisClient.js";

/**
 * Try to get from cache; if miss, run fetcher, store result, and return it.
 * @param {string}   key      - Redis key
 * @param {number}   ttl      - TTL in seconds
 * @param {Function} fetcher  - async function that returns the data to cache
 * @returns {Promise<{data: any, fromCache: boolean}>}
 */
export const cacheGet = async (key, ttl, fetcher) => {
  try {
    const cached = await redis.get(key);
    if (cached) {
      return { data: JSON.parse(cached), fromCache: true };
    }
  } catch (err) {
    console.error("Redis GET error (falling through to DB):", err.message);
  }

  // Cache miss — fetch from DB
  const data = await fetcher();

  // Store in cache (non-blocking, don't let Redis errors break the request)
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error("Redis SETEX error:", err.message);
  }

  return { data, fromCache: false };
};

/**
 * Invalidate all keys matching a pattern (e.g. "academy:*").
 * Uses SCAN to avoid blocking Redis on large key sets.
 * @param {string} pattern - glob pattern like "academy:*"
 */
export const cacheInvalidate = async (pattern) => {
  try {
    let cursor = "0";
    do {
      const [nextCursor, keys] = await redis.scan(cursor, "MATCH", pattern, "COUNT", 100);
      cursor = nextCursor;
      if (keys.length > 0) {
        await redis.del(...keys);
      }
    } while (cursor !== "0");
  } catch (err) {
    console.error("Redis invalidation error:", err.message);
  }
};

/**
 * Delete a single cache key.
 */
export const cacheDel = async (key) => {
  try {
    await redis.del(key);
  } catch (err) {
    console.error("Redis DEL error:", err.message);
  }
};
