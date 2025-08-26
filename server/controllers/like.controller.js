const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllLikes = async (req, res) => {
    try {
        const { post_id } = req.query;
        
        let likes;
        if (post_id) {
            // Filter likes by post_id
            likes = await prisma.likes.findMany({
                where: { post_id: Number(post_id) }
            });
        } else {
            // Get all likes
            likes = await prisma.likes.findMany();
        }
        
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching likes', error });
    }
};

exports.getLikeById = async (req, res) => {
    try {
        const like = await prisma.likes.findUnique({ where: { id: Number(req.params.id) } });
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
        const { post_id } = req.body;
        const user_id = req.user.id; // Get from JWT token

        console.log('Creating like with data:', { user_id, post_id });

        // Kiểm tra đã tồn tại like chưa
        const existingLike = await prisma.likes.findFirst({
            where: {
                user_id,
                post_id
            }
        });

        if (existingLike) {
            return res.status(409).json({ message: 'User has already liked this post.' });
        }

        const newLike = await prisma.likes.create({ 
            data: {
                user_id,
                post_id
            }
        });

        console.log('Like created successfully:', newLike);

        // Tạo notification cho chủ post (chỉ khi post có user_id)
        try {
            const post = await prisma.posts.findUnique({ 
                where: { id: post_id },
                select: { user_id: true }
            });
            
            if (post && post.user_id && post.user_id !== user_id) {
                await prisma.notificationss.create({
                    data: {
                        user_id: post.user_id,
                        type: 'like',
                        content: `User ${user_id} đã thích bài viết của bạn.`,
                        is_read: false,
                        createdAt: new Date(),
                        updatedAt: new Date(),
                    }
                });
            }
        } catch (notificationError) {
            console.log('Skipping notification creation (post may not have user_id):', notificationError.message);
        }

        res.status(201).json(newLike);
    } catch (error) {
        console.error('Detailed error in createLike:', error);
        res.status(400).json({ message: 'Error creating like', error });
    }
};

exports.updateLike = async (req, res) => {
    try {
        const updatedLike = await prisma.likes.update({
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
        await prisma.likes.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Like deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting like', error });
    }
};

exports.checkUserLike = async (req, res) => {
    try {
        const { post_id } = req.query;
        const user_id = req.user.id;

        if (!post_id) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        const existingLike = await prisma.likes.findFirst({
            where: {
                user_id,
                post_id: Number(post_id)
            }
        });

        res.status(200).json({ 
            liked: !!existingLike,
            likeId: existingLike?.id || null
        });
    } catch (error) {
        console.error('Error checking user like:', error);
        res.status(500).json({ message: 'Error checking user like', error });
    }
};