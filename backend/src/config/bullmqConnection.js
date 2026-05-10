const redisUrl = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const parsed = new URL(redisUrl);

const connection = {
  host: parsed.hostname,
  port: Number(parsed.port) || 6379,
  ...(parsed.password && { password: decodeURIComponent(parsed.password) }),
  ...(parsed.username && { username: decodeURIComponent(parsed.username) }),
};

export default connection;
