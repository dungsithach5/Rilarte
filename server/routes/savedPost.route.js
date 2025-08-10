const express = require('express');
const router = express.Router();

const {
    savePost,
    unsavePost,
    getSavedPosts,
    checkSavedPost
} = require('../controllers/savedPost.controller');

// Save/Unsave post
router.post('/save', savePost);
router.delete('/unsave', unsavePost);

// Get saved posts for a user
router.get('/user/:user_id', getSavedPosts);

// Check if post is saved
router.get('/check/:user_id/:post_id', checkSavedPost);

module.exports = router;
