const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to serialize BigInt values safely to JSON (as strings)
const serialize = (data) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
};

exports.getAllLikes = async (req, res) => {
    try {
        const { post_id } = req.query;
        
        let likes;
        if (post_id) {
            // Filter likes by post_id
            likes = await prisma.likes.findMany({
                where: { post_id: BigInt(post_id) }
            });
        } else {
            // Get all likes
            likes = await prisma.likes.findMany();
        }
        
        res.status(200).json(serialize(likes));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching likes', error });
    }
};

exports.getLikeById = async (req, res) => {
    try {
        const like = await prisma.likes.findUnique({ where: { id: BigInt(req.params.id) } });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }
        res.status(200).json(serialize(like));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching like', error });
    }
};

exports.createLike = async (req, res) => {
    try {
        const { post_id } = req.body;
        const user_id = BigInt(req.user.id); // Get from JWT token

        console.log('Creating like with data:', { user_id, post_id });

        // Kiểm tra đã tồn tại like chưa
        const existingLike = await prisma.likes.findFirst({
            where: {
                user_id,
                post_id: BigInt(post_id)
            }
        });

        if (existingLike) {
            return res.status(409).json({ message: 'User has already liked this post.' });
        }

        const newLike = await prisma.likes.create({ 
            data: {
                user_id,
                post_id: BigInt(post_id)
            }
        });

        console.log('Like created successfully:', newLike);

        // Tạo notification cho chủ post (chỉ khi post có user_id)
        try {
            const post = await prisma.posts.findUnique({ 
                where: { id: BigInt(post_id) },
                select: { user_id: true }
            });
            
            if (post && post.user_id && post.user_id !== user_id) {
                await prisma.notifications.create({
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

        res.status(201).json(serialize(newLike));
    } catch (error) {
        console.error('Detailed error in createLike:', error);
        res.status(400).json({ message: 'Error creating like', error });
    }
};

exports.updateLike = async (req, res) => {
    try {
        const updatedLike = await prisma.likes.update({
            where: { id: BigInt(req.params.id) },
            data: req.body
        });
        res.status(200).json(serialize(updatedLike));
    } catch (error) {
        res.status(400).json({ message: 'Error updating like', error });
    }
};

exports.deleteLike = async (req, res) => {
    try {
        await prisma.likes.delete({ where: { id: BigInt(req.params.id) } });
        res.status(200).json({ message: 'Like deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting like', error });
    }
};

exports.checkUserLike = async (req, res) => {
    try {
        const { post_id } = req.query;
        const user_id = BigInt(req.user.id);

        if (!post_id) {
            return res.status(400).json({ message: 'Post ID is required' });
        }

        const existingLike = await prisma.likes.findFirst({
            where: {
                user_id,
                post_id: BigInt(post_id)
            }
        });

        res.status(200).json(serialize({ 
            liked: !!existingLike,
            likeId: existingLike?.id || null
        }));
    } catch (error) {
        console.error('Error checking user like:', error);
        res.status(500).json({ message: 'Error checking user like', error });
    }
};
