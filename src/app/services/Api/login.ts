import API from './index';

interface LoginResponse {
  user: {
    avatar?: string;
    [key: string]: any;
  };
  token: string;
  message?: string;
}

export const loginUser = async (
  email: string,
  password: string
): Promise<LoginResponse> => {
  const res = await API.post('/users/login', { email, password });
  return res.data;
};
