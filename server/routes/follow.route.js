const express = require('express');
const router = express.Router();

const {
    getAllFollows,
    getFollowById,
    createFollow,
    updateFollow,
    deleteFollow,
} = require('../controllers/follow.controller');

router
    .route('/')
    .get(getAllFollows)
    .post(createFollow);

router
    .route('/:id')
    .get(getFollowById)
    .put(updateFollow)
    .delete(deleteFollow);

module.exports = router;
