const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
    getAllLikes,
    getLikeById,
    createLike,
    updateLike,
    deleteLike,
    checkUserLike,
} = require('../controllers/like.controller');

router
    .route('/')
    .get(getAllLikes)
    .post(auth, createLike);

router
    .route('/check')
    .get(auth, checkUserLike);

router
    .route('/:id')
    .get(getLikeById)
    .put(auth, updateLike)
    .delete(auth, deleteLike);

module.exports = router;
