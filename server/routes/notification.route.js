const express = require('express');
const router = express.Router();

const {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    getNotificationsByUser,
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

router.get('/user/:user_id', getNotificationsByUser);

module.exports = router;
