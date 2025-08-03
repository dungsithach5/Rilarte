const express = require('express');
const router = express.Router();
const { likeComment, unlikeComment, getCommentLikes, checkUserLikeComment } = require('../controllers/commentLike.controller');
const auth = require('../middleware/auth');

// Like a comment
router.post('/:comment_id/like', auth, likeComment);

// Unlike a comment
router.delete('/:comment_id/like', auth, unlikeComment);

// Get likes for a comment
router.get('/:comment_id/likes', getCommentLikes);

// Check if user liked a comment
router.get('/:comment_id/check-like', auth, checkUserLikeComment);

module.exports = router; 