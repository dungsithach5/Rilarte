const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function createTestUser() {
  try {
    console.log('🧪 Creating test user...');
    
    // Hash password
    const hashedPassword = await bcrypt.hash('Test123456!', 10);
    
    // Tạo user test
    const testUser = await prisma.users.create({
      data: {
        email: 'testuser456@gmail.com',
        username: 'testuser456',
        password: hashedPassword,
        avatar_url: '/img/user.png',
        onboarded: false,
        gender: null,
        bio: 'This is a test user for onboarding flow',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Test user created:', {
      id: testUser.id,
      email: testUser.email,
      username: testUser.username,
      onboarded: testUser.onboarded,
      hasPassword: !!testUser.password
    });
    
    // Tạo posts test
    const post1 = await prisma.posts.create({
      data: {
        user_id: testUser.id,
        title: 'Test Post 1',
        content: 'This is a test post for onboarding flow',
        image_url: '/img/slide1.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    const post2 = await prisma.posts.create({
      data: {
        user_id: testUser.id,
        title: 'Test Post 2',
        content: 'Another test post to check feed',
        image_url: '/img/slide2.png',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Test posts created:', {
      post1: { id: post1.id, title: post1.title },
      post2: { id: post2.id, title: post2.title }
    });
    
    // Tạo post_topics
    await prisma.post_topics.create({
      data: {
        post_id: post1.id,
        topic_id: 1,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    await prisma.post_topics.create({
      data: {
        post_id: post2.id,
        topic_id: 2,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Post topics created');
    
    // Test API
    const user = await prisma.users.findUnique({
      where: { email: 'testuser456@gmail.com' }
    });
    
    console.log('🔍 User found in database:', {
      id: user.id,
      email: user.email,
      onboarded: user.onboarded
    });
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Main function
async function main() {
  try {
    await createTestUser();
    console.log('✅ All done!');
  } catch (error) {
    console.error('❌ Main error:', error);
  }
}

// Run main function
main(); 