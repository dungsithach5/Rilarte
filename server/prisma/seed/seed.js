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
    if (!imageUrl || typeof imageUrl !== 'string') return null;

    const response = await fetch(imageUrl, {
      timeout: 10000,
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) return null;

    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.startsWith('image/')) return null;

    const buffer = await response.arrayBuffer();
    if (!buffer || buffer.byteLength === 0) return null;

    const colorResult = await ColorThief.getColor(Buffer.from(buffer));
    if (!colorResult || !Array.isArray(colorResult) || colorResult.length !== 3) return null;

    const [r, g, b] = colorResult;
    return rgbToHex(r, g, b);
  } catch {
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

  // Tags chia theo topic
  const topicTags = {
    Art: [
      "painting","illustration","digital-art","abstract","portrait","sketch","modern","surrealism",
      "oil-painting","watercolor","sculpture","graffiti","street-art","concept-art","line-art","calligraphy",
      "comic","manga","anime-art","pop-art"
    ],
    Fashion: [
      "streetwear","vintage","luxury","runway","casual","style","accessories","makeup",
      "hairstyle","formal","shoes","bags","hats","jewelry","denim","minimalist-fashion",
      "boho","urban-style","couture","sustainable-fashion"
    ],
    Food: [
      "dessert","cuisine","vegan","street-food","coffee","drinks","seafood","fruit",
      "cake","pizza","burger","pasta","sushi","ramen","salad","grill","steak","bbq","ice-cream","tea"
    ],
    Relaxing: [
      "chill","calm","nature","meditation","sunset","ocean","mountain","forest",
      "cozy","sleep","yoga-music","peaceful","spa","relax-vibes","books","slow-life",
      "camping","stargazing","minimalism","selfcare"
    ],
    Sport: [
      "football","basketball","yoga","running","gym","swimming","cycling","tennis",
      "volleyball","surfing","boxing","martial-arts","climbing","golf","skateboarding","skiing",
      "snowboarding","hiking","esports","dance"
    ],
    Travel: [
      "beach","mountains","adventure","cityscape","culture","backpacking","roadtrip","island",
      "temple","museum","local-food","festival","hiking-trails","desert","countryside","historic-sites",
      "wildlife","cruise","nightlife","landscape"
    ]
  };

  // Seed tags
  for (const [topic, tags] of Object.entries(topicTags)) {
    for (const name of tags) {
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
        bio: faker.company.catchPhrase(),
        avatar_url: faker.image.avatar(),
        onboarded: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
    users.push(user);
  }

  // Fake 50 posts
  for (let i = 0; i < 50; i++) {
    const randomUser = users[Math.floor(Math.random() * users.length)];
    const randomHeight = getRandomHeight();
    const imageUrl = `https://picsum.photos/seed/${faker.string.uuid()}/400/${randomHeight}`;

    // Lấy dominant color
    const dominantColor = await getDominantColor(imageUrl);

    const post = await prisma.posts.create({
      data: {
        user_id: randomUser.id,
        user_name: randomUser.username,
        title: faker.hacker.phrase(),
        content: Array.from({ length: 3 }, () => faker.company.catchPhrase()).join(". "),
        image_url: imageUrl,
        dominant_color: dominantColor,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });

    // Gán tags random
    const randomTagIds = getRandomTagIds();
    for (const tagId of randomTagIds) {
      await prisma.post_tags.create({
        data: {
          post_id: post.id,
          tag_id: tagId,
        },
      });
    }

    const numComments = Math.floor(Math.random() * 2) + 1;
    for (let j = 0; j < numComments; j++) {
      const commentUser = users[Math.floor(Math.random() * users.length)];
      await prisma.comments.create({
        data: {
          post_id: post.id,
          user_id: commentUser.id,
          content: faker.hacker.phrase(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });
    }
  
    const numLikes = Math.floor(Math.random() * 21);
    const shuffledUsers = [...users].sort(() => 0.5 - Math.random()).slice(0, numLikes);
  
    for (const likeUser of shuffledUsers) {
      await prisma.likes.create({
        data: {
          post_id: post.id,
          user_id: likeUser.id,
          createdAt: new Date(),
        },
      });
    }
  }


  console.log('✅ Đã seed xong 10 users, 50 posts và nhiều tags theo topics!');
}

main()
  .catch((e) => {
    console.error('❌ Lỗi khi seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
