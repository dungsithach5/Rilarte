const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

const {
    getAllNotifications,
    getNotificationById,
    createNotification,
    updateNotification,
    deleteNotification,
    getNotificationsByUser,
    markNotificationAsRead,
    markAllNotificationsAsRead,
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

// Mark notification as read
router.put('/:notification_id/read', auth, markNotificationAsRead);

// Mark all notifications as read
router.put('/user/:user_id/read-all', auth, markAllNotificationsAsRead);

module.exports = router;
