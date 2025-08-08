const axios = require('axios');

async function testUserPosts() {
  try {
    console.log('🔍 Testing user posts API...');
    
    // Test với user ID 22 (testuser2025@example.com)
    const userId = 22;
    
    console.log(`\n=== Fetching posts for user ID: ${userId} ===`);
    const response = await axios.get(`http://localhost:5001/api/posts?user_id=${userId}`);
    
    console.log(`✅ Found ${response.data.length} posts for user ${userId}`);
    
    if (response.data.length > 0) {
      console.log('\n📝 Posts preview:');
      response.data.forEach((post, index) => {
        console.log(`${index + 1}. "${post.title}" by ${post.user_name} (ID: ${post.user_id})`);
      });
    } else {
      console.log('📭 No posts found for this user');
    }
    
    // Test so sánh với tất cả posts
    console.log('\n=== Comparing with all posts ===');
    const allPostsResponse = await axios.get('http://localhost:5001/api/posts');
    console.log(`📊 Total posts in system: ${allPostsResponse.data.length}`);
    console.log(`📊 User ${userId} posts: ${response.data.length}`);
    
  } catch (error) {
    console.error('❌ Error testing user posts:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testUserPosts();
