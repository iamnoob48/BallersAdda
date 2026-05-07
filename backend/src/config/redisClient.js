import Redis from "ioredis";

if (!process.env.REDIS_URL && process.env.NODE_ENV === 'production') {
  throw new Error('REDIS_URL environment variable is required in production');
}

const redis = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    if (times > 5) return null; // stop retrying after 5 attempts
    return Math.min(times * 200, 2000);
  },
});

redis.on("connect", () => console.log("Redis connected"));
redis.on("error", (err) => console.error("Redis error:", err.message));

export default redis;
