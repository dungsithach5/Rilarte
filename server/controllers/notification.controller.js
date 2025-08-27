const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notifications.findMany();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

exports.getNotificationById = async (req, res) => {
    try {
        const notification = await prisma.notifications.findUnique({ where: { id: Number(req.params.id) } });
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
        const newNotification = await prisma.notifications.create({ data: req.body });
        res.status(201).json(newNotification);
    } catch (error) {
        res.status(400).json({ message: 'Error creating notification', error });
    }
};

exports.updateNotification = async (req, res) => {
    try {
        const updatedNotification = await prisma.notifications.update({
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
        await prisma.notifications.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Notification deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting notification', error });
    }
};

exports.getNotificationsByUser = async (req, res) => {
    try {
        const user_id = Number(req.params.user_id);
        console.log('📥 Fetching notifications for user:', user_id);
        
        const notifications = await prisma.notifications.findMany({
            where: { user_id },
            orderBy: { createdAt: 'desc' }
        });
        
        console.log('📥 Raw notifications from DB:', notifications);
        
        // Format notifications để frontend dễ sử dụng
        const formattedNotifications = notifications.map(notification => ({
            id: notification.id,
            type: notification.type,
            content: notification.content,
            is_read: notification.is_read,
            createdAt: notification.createdAt,
            related_user_id: notification.related_user_id,
            related_post_id: notification.related_post_id,
            related_comment_id: notification.related_comment_id
        }));
        
        console.log('📥 Formatted notifications:', formattedNotifications);
        res.status(200).json(formattedNotifications);
    } catch (error) {
        console.error('❌ Error in getNotificationsByUser:', error);
        res.status(500).json({ message: 'Error fetching notifications', error: error.message });
    }
};

exports.markNotificationAsRead = async (req, res) => {
    try {
        const { notification_id } = req.params;
        const user_id = req.user.id;
        
        const notification = await prisma.notifications.update({
            where: { 
                id: Number(notification_id),
                user_id: user_id // Đảm bảo user chỉ update notification của mình
            },
            data: { 
                is_read: true,
                updatedAt: new Date()
            }
        });
        
        res.status(200).json(notification);
    } catch (error) {
        res.status(500).json({ message: 'Error updating notification', error });
    }
};

exports.markAllNotificationsAsRead = async (req, res) => {
    try {
        const user_id = req.user.id;
        
        await prisma.notifications.updateMany({
            where: { 
                user_id: user_id,
                is_read: false
            },
            data: { 
                is_read: true,
                updatedAt: new Date()
            }
        });
        
        res.status(200).json({ message: 'All notifications marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error updating notifications', error });
    }
};