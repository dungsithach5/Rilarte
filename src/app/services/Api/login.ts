import API from './index';

interface LoginResponse {
  success: boolean;
  user: {
    avatar?: string;
    avatar_url?: string;
    [key: string]: any;
  };
  token: string;
  message?: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const res = await API.post('/users/login', { email, password });
    return res.data;
  } catch (error: any) {
    // Handle axios error response
    if (error.response && error.response.data) {
      // Server responded with error status
      throw new Error(error.response.data.message || 'Login failed');
    } else if (error.request) {
      // Network error
      throw new Error('Network error. Please check your connection.');
    } else {
      // Other error
      throw new Error('An unexpected error occurred.');
    }
  }
};
