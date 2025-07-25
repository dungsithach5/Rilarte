const express = require('express');
const router = express.Router();

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
    .post(createComment);

router
    .route('/:id')
    .get(getCommentById)
    .put(updateComment)
    .delete(deleteComment);


module.exports = router;