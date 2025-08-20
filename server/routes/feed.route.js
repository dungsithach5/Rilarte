const express = require('express');
const router = express.Router();
const feedController = require('../controllers/feed.controller');

// Lấy feed cho user theo topics
router.get('/:id', feedController.getUserFeed);

module.exports = router;
