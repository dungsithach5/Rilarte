const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const topicsData = [
  { id: 6, name: "Art", image_url: "https://images.unsplash.com/photo-1614812511804-a62c6ce2f5fb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDl8fHxlbnwwfHx8fHw%3D" },
  { id: 1, name: "Fashion", image_url: "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 4, name: "Food", image_url: "https://plus.unsplash.com/premium_photo-1677706562643-0a029dbc9b97?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 3, name: "Relaxing", image_url: "https://images.unsplash.com/photo-1594125675127-554af2f078f3?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 2, name: "Sport", image_url: "https://images.unsplash.com/photo-1599586120429-48281b6f0ece?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id: 5, name: "Travel", image_url: "https://images.unsplash.com/photo-1475688621402-4257c812d6db?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
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
        image_url: topic.image_url,
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
