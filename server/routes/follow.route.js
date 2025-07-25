const express = require('express');
const router = express.Router();

const {
    getAllFollows,
    getFollowById,
    createFollow,
    updateFollow,
    deleteFollow,
    unfollow,
    getFollowStats,
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

router.post('/unfollow', unfollow);
router.get('/stats/:userId', getFollowStats);

module.exports = router;
