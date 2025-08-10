const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const prisma = new PrismaClient();

const ColorThief = require('colorthief');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

function rgbToHex(r, g, b) {
  return (
    "#" +
    [r, g, b]
      .map((x) => {
        const hex = x.toString(16);
        return hex.length === 1 ? "0" + hex : hex;
      })
      .join("")
  );
}

async function getDominantColor(imageUrl) {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') {
      return null;
    }

    const response = await fetch(imageUrl, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    });

    if (!response.ok) {
      return null;
    }

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) {
      return null;
    }

    const buffer = await response.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) {
      return null;
    }

    const colorResult = await ColorThief.getColor(Buffer.from(buffer));
    if (!colorResult || !Array.isArray(colorResult) || colorResult.length !== 3) {
      return null;
    }

    const [r, g, b] = colorResult;
    if (r < 0 || r > 255 || g < 0 || g > 255 || b < 0 || b > 255) {
      return null;
    }

    return rgbToHex(r, g, b);
  } catch (err) {
    return null;
  }
}

function getRandomHeight(min = 250, max = 750) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  // Xóa dữ liệu cũ
  await prisma.post_tags.deleteMany();
  await prisma.tags.deleteMany();
  await prisma.posts.deleteMany();
  await prisma.users.deleteMany();

  // Tạo danh sách tags mặc định
  const defaultTags = ["art", "nature", "photography", "design", "travel", "abstract", "modern", "life", "street", "portrait"];

  for (const name of defaultTags) {
    await prisma.tags.upsert({
      where: { name },
      update: {},
      create: {
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  // Lấy lại danh sách tags sau khi tạo
  const tagRecords = await prisma.tags.findMany();
  const tagIds = tagRecords.map((tag) => tag.id);

  function getRandomTagIds() {
    const shuffled = [...tagIds].sort(() => 0.5 - Math.random());
    const count = Math.floor(Math.random() * 4) + 1; // 1–4 tags
    return shuffled.slice(0, count);
  }

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
  for (let i = 0; i < 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomHeight = getRandomHeight();
    const imageUrl = `https://picsum.photos/seed/${faker.string.uuid()}/400/${randomHeight}`;

    // Lấy dominant color từ ảnh (có thể mất thời gian)
    const dominantColor = await getDominantColor(imageUrl);

    // Tạo post
    const post = await prisma.posts.create({
      data: {
        user_id: randomUser.id,
        user_name: randomUser.username,
        title: faker.lorem.sentence(),
        content: faker.lorem.paragraphs(2),
        image_url: imageUrl,
        dominant_color: dominantColor,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    const randomTagIds = getRandomTagIds();
    for (const tagId of randomTagIds) {
      await prisma.post_tags.create({
        data: {
          post_id: post.id,
          tag_id: tagId,
        },
      });
    }
  }

  console.log('✅ Đã seed xong 10 users, 100 posts và gán tags!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
