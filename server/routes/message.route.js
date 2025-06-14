const express = require('express');
const router = express.Router();

const {
    getAllMessages,
    getMessageById,
    createMessage,
    updateMessage,
    deleteMessage,
} = require('../controllers/message.controller');

router
    .route('/')
    .get(getAllMessages)
    .post(createMessage);

router
    .route('/:id')
    .get(getMessageById)
    .put(updateMessage)
    .delete(deleteMessage);

module.exports = router;
