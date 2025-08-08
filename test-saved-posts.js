const axios = require('axios');

async function testSavedPostsAPI() {
  try {
    console.log('🔖 Testing Saved Posts API...');
    
    const testUserId = 22; // testuser2025@example.com
    const testPostId = 44; // Post đã tạo trước đó
    
    console.log('\n=== 1. Save a post ===');
    const saveResponse = await axios.post('http://localhost:5001/api/saved-posts/save', {
      user_id: testUserId,
      post_id: testPostId
    });
    console.log('✅ Post saved:', saveResponse.data);
    
    console.log('\n=== 2. Check if post is saved ===');
    const checkResponse = await axios.get(`http://localhost:5001/api/saved-posts/check/${testUserId}/${testPostId}`);
    console.log('✅ Save status:', checkResponse.data);
    
    console.log('\n=== 3. Get saved posts for user ===');
    const savedPostsResponse = await axios.get(`http://localhost:5001/api/saved-posts/user/${testUserId}`);
    console.log(`✅ Found ${savedPostsResponse.data.length} saved posts`);
    
    if (savedPostsResponse.data.length > 0) {
      console.log('📝 Saved posts preview:');
      savedPostsResponse.data.forEach((post, index) => {
        console.log(`${index + 1}. "${post.title}" by ${post.user_name}`);
      });
    }
    
    console.log('\n=== 4. Unsave the post ===');
    const unsaveResponse = await axios.delete('http://localhost:5001/api/saved-posts/unsave', {
      data: {
        user_id: testUserId,
        post_id: testPostId
      }
    });
    console.log('✅ Post unsaved:', unsaveResponse.data);
    
    console.log('\n=== 5. Verify post is unsaved ===');
    const checkAgainResponse = await axios.get(`http://localhost:5001/api/saved-posts/check/${testUserId}/${testPostId}`);
    console.log('✅ Final save status:', checkAgainResponse.data);
    
  } catch (error) {
    console.error('❌ Error testing saved posts API:');
    console.error('Status:', error.response?.status);
    console.error('Data:', error.response?.data);
    console.error('Message:', error.message);
  }
}

testSavedPostsAPI();
