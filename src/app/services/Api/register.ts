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
  const response = await API.post('/users/send-otp', { email });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await API.post('/users/verify-otp', { email, otp });
  return response.data;
};