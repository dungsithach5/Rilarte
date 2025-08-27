import API from './index';

export const fetchPosts = async (search: string) => {
  try {
    const res = await API.get('/posts', {
      params: search ? { search } : {},
    });
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching posts:', {
      message: error?.message || 'Unknown error',
      status: error?.response?.status,
      data: error?.response?.data
    });
    return [];
  }
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
  try {
    const res = await API.get('/posts/by-color', {
      params: { color }
    });
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching posts by color:', {
      message: error?.message || 'Unknown error',
      status: error?.response?.status,
      data: error?.response?.data
    });
    return [];
  }
};