const express = require('express');
const router = express.Router();

const {
    getAllComments,
    getCommentById,
    createComment,
    updateComment,
    deleteComment,
} = require('../controllers/comment.controller');

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