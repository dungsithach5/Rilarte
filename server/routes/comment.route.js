const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
    getAllComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
    getCommentsByPostId,
} = require('../controllers/comment.controller');

// Route comment post_id kèm replies
router.get('/post/:post_id', getCommentsByPostId);

router
    .route('/')
    .get(getAllComments)
    .post(auth, createComment);

router
    .route('/:id')
    .get(getCommentById)
    .put(auth, updateComment)
    .delete(auth, deleteComment);

module.exports = router;