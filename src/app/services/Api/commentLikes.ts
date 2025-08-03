import API from './index';

// Like a comment
export const likeComment = async (commentId: number) => {
  try {
    const response = await API.post(`/comment-likes/${commentId}/like`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Unlike a comment
export const unlikeComment = async (commentId: number) => {
  try {
    const response = await API.delete(`/comment-likes/${commentId}/like`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get likes for a comment
export const getCommentLikes = async (commentId: number) => {
  try {
    const response = await API.get(`/comment-likes/${commentId}/likes`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Check if user liked a comment
export const checkUserLikeComment = async (commentId: number) => {
  try {
    const response = await API.get(`/comment-likes/${commentId}/check-like`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 