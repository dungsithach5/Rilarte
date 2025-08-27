const Redis = require("ioredis");

// Kết nối tới Redis Docker
const redis = new Redis({
  host: "127.0.0.1",
  port: 6379
});

async function testRedis() {
  await redis.set("hello", "Xin chào từ Redis!", "EX", 60);
  const value = await redis.get("hello");
  console.log("📦 Redis says:", value);

  process.exit(0);
}

testRedis();
