const express = require('express');
const router = express.Router();

const {
    getAllPosts,
    getPostById,
    createPost,
    updatePost,
    deletePost,
    getColors,
    getPostsByColor,
} = require('../controllers/post.controller');

router.get('/colors', getColors);
router.get('/by-color', getPostsByColor);

router
    .route('/')
    .get(getAllPosts)
    .post(createPost);

router
    .route('/:id')
    .get(getPostById)
    .put(updatePost)
    .delete(deletePost);

module.exports = router;
