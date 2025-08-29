const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.getAllComments = async (req, res) => {
    try {
        const { post_id } = req.query;
        
        let comments;
        if (post_id) {
            // Filter comments by post_id
            comments = await prisma.comments.findMany({
                where: { post_id: Number(post_id) },
                orderBy: { createdAt: 'desc' }
            });
        } else {
            // Get all comments
            comments = await prisma.comments.findMany({
                orderBy: { createdAt: 'desc' }
            });
        }
        
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error });
    }
};

exports.getCommentById = async (req, res) => {
    try {
        const comment = await prisma.comments.findUnique({ where: { id: Number(req.params.id) } });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comment', error });
    }
};

exports.createComment = async (req, res) => {
    try {
        const { post_id, content, parent_id } = req.body;
        const user_id = req.user.id; // Get from JWT token

        const newComment = await prisma.comments.create({
            data: {
                user_id,
                post_id,
                content,
                parent_id: parent_id || null,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });

        // Tạo notification cho chủ post hoặc chủ comment cha
        let targetUserId = null;
        let notificationContent = '';
        let notificationType = '';
        
        if (parent_id) {
            const parentComment = await prisma.comments.findUnique({ 
                where: { id: parent_id },
                include: { users: { select: { username: true } } }
            });
            targetUserId = parentComment?.user_id;
            notificationContent = `đã trả lời bình luận của bạn`;
            notificationType = 'comment_reply';
        } else {
            const post = await prisma.posts.findUnique({ 
                where: { id: post_id },
                include: { users: { select: { username: true } } }
            });
            targetUserId = post?.user_id;
            notificationContent = `đã bình luận vào bài viết của bạn`;
            notificationType = 'comment';
        }
        
        if (targetUserId && targetUserId !== user_id) {
            // Lấy username của user comment
            const commentUser = await prisma.users.findUnique({
                where: { id: user_id },
                select: { username: true, avatar_url: true }
            });
            
            const notification = await prisma.notifications.create({
                data: {
                    user_id: targetUserId,
                    type: notificationType,
                    content: notificationContent,
                    related_user_id: user_id,
                    related_post_id: post_id,
                    related_comment_id: newComment.id,
                    is_read: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });

            // Emit notification via WebSocket
            if (global.emitNotification) {
                global.emitNotification(targetUserId, {
                    id: notification.id,
                    type: notification.type,
                    content: notification.content,
                    is_read: notification.is_read,
                    createdAt: notification.createdAt,
                    related_user_id: notification.related_user_id,
                    related_post_id: notification.related_post_id,
                    related_comment_id: notification.related_comment_id
                });
            }
        }

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(400).json({ message: 'Error creating comment', error });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const updatedComment = await prisma.comments.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(400).json({ message: 'Error updating comment', error });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        await prisma.comments.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error });
    }
};

exports.getCommentsByPostId = async (req, res) => {
    try {
        const post_id = Number(req.params.post_id);

        //comment gốc
        const comments = await prisma.comments.findMany({
            where: {
                post_id,
                parent_id: null
            },
            include: {
                replies: true //  (comment con)
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error });
    }
};

exports.getAllNotifications = async (req, res) => {
    try {
        const notifications = await prisma.notifications.findMany();
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};

exports.getNotificationsByUser = async (req, res) => {
    try {
        const user_id = Number(req.params.user_id);
        const notifications = await prisma.notifications.findMany({
            where: { user_id },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json(notifications);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching notifications', error });
    }
};