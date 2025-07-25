const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllLikes = async (req, res) => {
    try {
        const likes = await prisma.like.findMany();
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching likes', error });
    }
};

exports.getLikeById = async (req, res) => {
    try {
        const like = await prisma.like.findUnique({ where: { id: Number(req.params.id) } });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }
        res.status(200).json(like);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching like', error });
    }
};

exports.createLike = async (req, res) => {
    try {
        const { userId, postId, commentId } = req.body;

        // Kiểm tra đã tồn tại like chưa (theo userId + postId hoặc userId + commentId)
        const existingLike = await prisma.like.findFirst({
            where: {
                userId,
                ...(postId ? { postId } : {}),
                ...(commentId ? { commentId } : {})
            }
        });

        if (existingLike) {
            return res.status(409).json({ message: 'User has already liked this item.' });
        }

        const newLike = await prisma.like.create({ data: req.body });

        // Tạo notification cho chủ post/comment
        let targetUserId = null;
        if (postId) {
            const post = await prisma.posts.findUnique({ where: { id: postId } });
            targetUserId = post?.user_id;
        }
        if (commentId) {
            const comment = await prisma.comment.findUnique({ where: { id: commentId } });
            targetUserId = comment?.user_id;
        }
        if (targetUserId && targetUserId !== userId) {
            await prisma.notification.create({
                data: {
                    user_id: targetUserId,
                    type: 'like',
                    content: `User ${userId} đã thích nội dung của bạn.`,
                    is_read: false,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            });
        }

        res.status(201).json(newLike);
    } catch (error) {
        res.status(400).json({ message: 'Error creating like', error });
    }
};

exports.updateLike = async (req, res) => {
    try {
        const updatedLike = await prisma.like.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.status(200).json(updatedLike);
    } catch (error) {
        res.status(400).json({ message: 'Error updating like', error });
    }
};

exports.deleteLike = async (req, res) => {
    try {
        await prisma.like.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Like deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting like', error });
    }
};
