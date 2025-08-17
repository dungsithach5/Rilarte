const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const topicsData = [
  { id: 6, name: "Art" },
  { id: 1, name: "Fashion" },
  { id: 4, name: "Food" },
  { id: 3, name: "Relaxing" },
  { id: 2, name: "Sport" },
  { id: 5, name: "Travel" },
];

async function main() {
  // Xóa dữ liệu cũ
  await prisma.user_topics.deleteMany();
  await prisma.topics.deleteMany();

  for (const topic of topicsData) {
    await prisma.topics.create({
      data: {
        id: topic.id,
        name: topic.name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  console.log('✅ Đã seed xong topics!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed topics:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
