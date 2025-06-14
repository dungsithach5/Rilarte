const { Notification } = require('../models');

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await Notification.findAll();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const notification = await Notification.findByPk(req.params.id);
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notification', error });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const newNotification = await Notification.create(req.body);
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({ message: 'Error creating notification', error });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const [updatedRows] = await Notification.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        const updatedNotification = await Notification.findByPk(req.params.id);
        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(400).json({ message: 'Error updating notification', error });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        const deletedRows = await Notification.destroy({
            where: { id: req.params.id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Notification not found' });
        }

        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
};
