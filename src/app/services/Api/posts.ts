import API from './index';

export const fetchPosts = async (search: string) => {
  const res = await API.get('/posts', {
    params: search ? { search } : {},
  });
  return res.data;
};
