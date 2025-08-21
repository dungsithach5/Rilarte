const axios = require('axios');

async function testFrontendAPI() {
  console.log('🧪 Testing Frontend API calls...');
  
  try {
    // Test 1: Basic API call
    console.log('\n📡 Test 1: Basic API call');
    const response1 = await axios.post('http://localhost:5001/api/users/send-otp', {
      email: 'test@example.com'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    console.log('✅ Response 1:', response1.data);
    console.log('📊 Status:', response1.status);
    console.log('🔗 Headers:', response1.headers);
    
    // Test 2: Simulate frontend error handling
    console.log('\n📡 Test 2: Simulate frontend error handling');
    try {
      const response2 = await axios.post('http://localhost:5001/api/users/send-otp', {
        email: 'test@example.com'
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:3000'
        }
      });
      
      console.log('✅ Response 2:', response2.data);
      
      // Simulate what frontend does
      if (response2.data && response2.data.message) {
        console.log('✅ Frontend would set otpSent = true');
        console.log('✅ Frontend would show success message');
      } else {
        console.log('❌ Frontend would show error: No message in response');
      }
      
    } catch (error) {
      console.log('❌ Frontend would catch error:', error.message);
    }
    
    // Test 3: Check if response format matches frontend expectations
    console.log('\n📡 Test 3: Check response format');
    const response3 = await axios.post('http://localhost:5001/api/users/send-otp', {
      email: 'test@example.com'
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Origin': 'http://localhost:3000'
      }
    });
    
    const data = response3.data;
    console.log('📊 Response data:', data);
    console.log('🔍 Has message property:', !!data.message);
    console.log('🔍 Message content:', data.message);
    console.log('🔍 Is success response:', data.message && data.message.includes('OTP sent'));
    
    if (data.message && data.message.includes('OTP sent')) {
      console.log('✅ Response format matches frontend expectations');
    } else {
      console.log('❌ Response format may not match frontend expectations');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    
    if (error.response) {
      console.error('📊 Error response:', error.response.data);
      console.error('🔗 Error status:', error.response.status);
    }
  }
}

// Run test
testFrontendAPI(); 