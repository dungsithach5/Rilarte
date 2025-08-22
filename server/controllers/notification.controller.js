const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notification.findMany();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const notification = await prisma.notification.findUnique({ where: { id: Number(req.params.id) } });
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
        const newNotification = await prisma.notification.create({ data: req.body });
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({ message: 'Error creating notification', error });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const updatedNotification = await prisma.notification.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.status(200).json(updatedNotification);
    } catch (error) {
        res.status(400).json({ message: 'Error updating notification', error });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await prisma.notification.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
};

exports.getNotificationsByUser = async (req, res) => {
    try {
        const user_id = Number(req.params.user_id);
        const notifications = await prisma.notification.findMany({
            where: { user_id },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};