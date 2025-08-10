import API from './index';

export const fetchPosts = async (search: string) => {
  const res = await API.get('/posts', {
    params: search ? { search } : {},
  });
  return res.data;
};

export const fetchPostsByUserId = async (userId: number) => {
  const res = await API.get('/posts', {
    params: { user_id: userId },
  });
  return res.data;
};

export const deletePost = async (postId: number) => {
  return await API.delete(`/posts/${postId}`)
}

export const fetchColors = async (): Promise<string[]> => {
  const res = await API.get('/posts/colors');
  return res.data;
};

export const fetchPostsByColor = async (color: string) => {
  const res = await API.get('/posts/by-color', {
    params: { color }
  });
  return res.data;
};