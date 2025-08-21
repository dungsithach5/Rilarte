const express = require('express');
const router = express.Router();
const messageController = require('../controllers/message.controller');
const auth = require('../middleware/auth');

// Chat room routes
router.post('/rooms', auth, messageController.getOrCreateChatRoom);
router.get('/rooms/:user_id', auth, messageController.getUserChatRooms);

// Message routes
router.post('/send', auth, messageController.sendMessage);
router.get('/chat/:room_id', auth, messageController.getChatMessages);
router.put('/read/:message_id', auth, messageController.markMessageAsRead);
router.put('/room/read', auth, messageController.markRoomAsRead);
router.delete('/:message_id', auth, messageController.deleteMessage);

module.exports = router;
