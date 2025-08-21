const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to serialize BigInt values safely to JSON (as strings)
const serialize = (data) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
};

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notifications.findMany();
        res.status(200).json(serialize(notifications));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const notification = await prisma.notifications.findUnique({ where: { id: BigInt(req.params.id) } });
        if (!notification) {
            return res.status(404).json({ message: 'Notification not found' });
        }
        res.status(200).json(serialize(notification));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notification', error });
    }
};

exports.createNotification = async (req, res) => {
    try {
        const newNotification = await prisma.notifications.create({ data: req.body });
        res.status(201).json(serialize(newNotification));
    } catch (error) {
        res.status(400).json({ message: 'Error creating notification', error });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const updatedNotification = await prisma.notifications.update({
            where: { id: BigInt(req.params.id) },
            data: req.body
        });
        res.status(200).json(serialize(updatedNotification));
    } catch (error) {
        res.status(400).json({ message: 'Error updating notification', error });
    }
};

exports.deleteNotification = async (req, res) => {
    try {
        await prisma.notifications.delete({ where: { id: BigInt(req.params.id) } });
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
};

exports.getNotificationsByUser = async (req, res) => {
    try {
        const user_id = BigInt(req.params.user_id);
        const notifications = await prisma.notifications.findMany({
            where: { user_id },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(serialize(notifications));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};
