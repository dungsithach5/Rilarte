const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  const seedDir = __dirname;

  // Lấy tất cả file .js trong thư mục seed trừ chính index.js
  const seedFiles = fs.readdirSync(seedDir)
    .filter(file => file.endsWith(".js") && file !== "index.js");

  // Chạy lần lượt từng seed file
  for (const file of seedFiles) {
    console.log(`👉 Seeding from: ${file}`);
    const seedFunction = require(path.join(seedDir, file));
    if (typeof seedFunction === "function") {
      await seedFunction(prisma);
    }
  }
}

main()
  .then(async () => {
    console.log("✅ All seeds completed!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seed error:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
