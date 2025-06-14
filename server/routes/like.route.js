const express = require('express');
const router = express.Router();

const {
    getAllLikes,
    getLikeById,
    createLike,
    updateLike,
    deleteLike,
} = require('../controllers/like.controller');

router
    .route('/')
    .get(getAllLikes)
    .post(createLike);

router
    .route('/:id')
    .get(getLikeById)
    .put(updateLike)
    .delete(deleteLike);

module.exports = router;
