const express = require('express');
const router = express.Router();

const {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
} = require('../controllers/notification.controller');

router
    .route('/')
    .get(getAllNotifications)
    .post(createNotification);

router
    .route('/:id')
    .get(getNotificationById)
    .put(updateNotification)
    .delete(deleteNotification);

module.exports = router;
