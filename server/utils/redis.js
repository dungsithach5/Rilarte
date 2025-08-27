const Redis = require("ioredis");

const redis = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: process.env.REDIS_PORT || 6379,
});

// ✅ Helper: Xoá cache theo pattern
async function invalidateCache(pattern) {
  const keys = await redis.keys(pattern);
  if (keys.length) {
    await redis.del(keys);
  }
}

redis.on("connect", () => console.log("✅ Redis connected"));
redis.on("error", (err) => console.error("❌ Redis error:", err));

module.exports = { redis, invalidateCache };
