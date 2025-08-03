import API from './index';

// Get comments for a post
export const getComments = async (postId: number) => {
  try {
    const response = await API.get(`/comments?post_id=${postId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Create a new comment
export const createComment = async (postId: number, content: string) => {
  try {
    const response = await API.post('/comments', { 
      post_id: postId, 
      content: content 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Update a comment
export const updateComment = async (commentId: number, content: string) => {
  try {
    const response = await API.put(`/comments/${commentId}`, { 
      content: content 
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Delete a comment
export const deleteComment = async (commentId: number) => {
  try {
    const response = await API.delete(`/comments/${commentId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 