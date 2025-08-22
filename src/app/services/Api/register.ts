import API from './index'

export const registerUser = async (formData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  try {
    const response = await API.post('/users/register', formData);
    return response.data;
  } catch (error: any) {
    // Handle axios error response
    if (error.response && error.response.data) {
      // Server responded with error status
      throw new Error(error.response.data.message || 'Registration failed');
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error('An unexpected error occurred.');
    }
  }
}

export const sendOtp = async (email: string) => {
  try {
    console.log('📧 Frontend API: Gửi OTP đến:', email);
    const response = await API.post('/users/send-otp', { email });
    console.log('✅ Frontend API: OTP gửi thành công:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Frontend API: Lỗi gửi OTP:', error);
    
    // Kiểm tra loại lỗi cụ thể
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - Server không phản hồi. Vui lòng thử lại.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Lỗi kết nối mạng - Không thể kết nối đến server. Vui lòng kiểm tra internet.');
    } else if (error.response && error.response.data) {
      const errorData = error.response.data;
      if (errorData.details) {
        throw new Error(`Gửi OTP thất bại: ${errorData.details}`);
      } else {
        throw new Error(errorData.message || 'Gửi OTP thất bại');
      }
    } else if (error.request) {
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
    } else {
      throw new Error(`Lỗi không xác định khi gửi OTP: ${error.message}`);
    }
  }
};

export const verifyOtp = async (email: string, otp: string) => {
  try {
    console.log('🔐 Frontend API: Xác thực OTP cho:', email);
    const response = await API.post('/users/verify-otp', { email, otp });
    console.log('✅ Frontend API: OTP xác thực thành công:', response.data);
    return response.data;
  } catch (error: any) {
    console.error('❌ Frontend API: Lỗi xác thực OTP:', error);
    
    // Kiểm tra loại lỗi cụ thể
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout - Server không phản hồi. Vui lòng thử lại.');
    } else if (error.code === 'ERR_NETWORK') {
      throw new Error('Lỗi kết nối mạng - Không thể kết nối đến server. Vui lòng kiểm tra internet.');
    } else if (error.response && error.response.data) {
      const errorData = error.response.data;
      throw new Error(errorData.message || 'Xác thực OTP thất bại');
    } else if (error.request) {
      throw new Error('Lỗi kết nối. Vui lòng kiểm tra internet và thử lại.');
    } else {
      throw new Error(`Lỗi không xác định khi xác thực OTP: ${error.message}`);
    }
  }
};