import API from './index';

// Like a post
export const likePost = async (postId: number) => {
  try {
    const response = await API.post('/likes', { post_id: postId });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Unlike a post
export const unlikePost = async (likeId: number) => {
  try {
    const response = await API.delete(`/likes/${likeId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get likes for a post
export const getPostLikes = async (postId: number) => {
  try {
    const response = await API.get(`/likes?post_id=${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if user liked a post
export const checkUserLikePost = async (postId: number) => {
  try {
    const response = await API.get(`/likes/check?post_id=${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 