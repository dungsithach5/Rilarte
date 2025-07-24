import API from './index'

export const registerUser = async (formData: {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}) => {
  const response = await API.post('/users/register', formData)
  return response.data
}

export const sendOtp = async (email: string) => {
  const response = await API.post('/users/send-otp', { email });
  return response.data;
};

export const verifyOtp = async (email: string, otp: string) => {
  const response = await API.post('/users/verify-otp', { email, otp });
  return response.data;
};