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