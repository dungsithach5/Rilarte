const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  console.log('🧪 Testing database connection and user creation...');
  
  const prisma = new PrismaClient();
  
  try {
    // Test 1: Database connection
    console.log('\n📡 Test 1: Database connection');
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test 2: Check if users table exists
    console.log('\n📡 Test 2: Check users table');
    const userCount = await prisma.users.count();
    console.log('✅ Users table exists, current count:', userCount);
    
    // Test 3: Try to create a test user
    console.log('\n📡 Test 3: Try to create test user');
    const testUser = await prisma.users.create({
      data: {
        username: `testuser_${Date.now()}`,
        email: `test_${Date.now()}@example.com`,
        password: 'testpassword123'
      }
    });
    console.log('✅ Test user created successfully:', {
      id: testUser.id,
      username: testUser.username,
      email: testUser.email
    });
    
    // Test 4: Clean up test user
    console.log('\n📡 Test 4: Clean up test user');
    await prisma.users.delete({
      where: { id: testUser.id }
    });
    console.log('✅ Test user deleted successfully');
    
    console.log('\n🎉 All database tests passed!');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
    
    if (error.code === 'P2002') {
      console.error('🔍 Duplicate constraint error - Field:', error.meta?.target);
    } else if (error.code === 'P2003') {
      console.error('🔍 Foreign key constraint error');
    } else if (error.code === 'P2014') {
      console.error('🔍 Invalid ID error');
    } else if (error.code === 'P2025') {
      console.error('🔍 Record not found error');
    } else {
      console.error('🔍 Unknown database error:', error.code, error.message);
    }
    
    console.error('🔍 Full error details:', error);
    
  } finally {
    await prisma.$disconnect();
    console.log('🔌 Database disconnected');
  }
}

// Run test
testDatabase(); 