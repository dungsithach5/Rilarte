const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

function getRandomHeight(min = 250, max = 500) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // Xóa dữ liệu cũ
  await prisma.posts.deleteMany();
  await prisma.users.deleteMany();

  const users = [];

  // Fake 10 users
  for (let i = 0; i < 10; i++) {
    const user = await prisma.users.create({
      data: {
        username: faker.internet.userName(),
        email: faker.internet.email(),
        password: faker.internet.password(),
        bio: faker.lorem.sentence(),
        avatar_url: faker.image.avatar(),
        onboarded: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    users.push(user);
  }

  // Fake 100 posts
  for (let i = 0; i < 20; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomHeight = getRandomHeight();


    await prisma.posts.create({
      data: {
        user_name: randomUser.username,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        image_url: `https://picsum.photos/seed/${faker.string.uuid()}/400/${randomHeight}`,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }


  console.log('✅ Đã seed xong 10 users và 100 posts (ảnh random masonry)!');
}


main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
