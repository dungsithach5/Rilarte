import API from './index';

export const savePost = async (userId: number, postId: number) => {
  const res = await API.post('/saved-posts/save', {
    user_id: userId,
    post_id: postId
  });
  return res.data;
};

export const unsavePost = async (userId: number, postId: number) => {
  const res = await API.delete('/saved-posts/unsave', {
    data: {
      user_id: userId,
      post_id: postId
    }
  });
  return res.data;
};

export const getSavedPosts = async (userId: number) => {
  const res = await API.get(`/saved-posts/user/${userId}`);
  return res.data;
};

export const checkSavedPost = async (userId: number, postId: number) => {
  const res = await API.get(`/saved-posts/check/${userId}/${postId}`);
  return res.data;
};
