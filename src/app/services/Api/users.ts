import API from './index';

export const searchUsers = async (keyword: string) => {
  if (!keyword) return [];
  const res = await API.get(`/users/search`, {
    params: { keyword },
  });
  return res.data;
};