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

// Lấy tất cả follows, tạo follow
router
  .route('/')
  .get(getAllFollows)
  .post(createFollow);

// Lấy, update, xóa theo id (id là id của bản ghi follow trong DB)
router
  .route('/:id')
  .get(getFollowById)
  .put(updateFollow)
  .delete(deleteFollow);

// Unfollow (dựa vào follower_id và following_id)
router.post('/unfollow', unfollow);

// Lấy stats
router.get('/stats/:userId', getFollowStats);

module.exports = router;
