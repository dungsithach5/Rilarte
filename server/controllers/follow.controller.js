const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to serialize BigInt values safely to JSON (as strings)
const serialize = (data) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
};

exports.getAllFollows = async (req, res) => {
    try {
        const follows = await prisma.follow.findMany();
        res.status(200).json(serialize(follows));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching follows', error });
    }
};

exports.getFollowById = async (req, res) => {
    try {
        const follow = await prisma.follow.findUnique({ where: { id: BigInt(req.params.id) } });
        if (!follow) {
            return res.status(404).json({ message: 'Follow not found' });
        }
        res.status(200).json(serialize(follow));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching follow', error });
    }
};

exports.createFollow = async (req, res) => {
    try {
        const { follower_id, following_id } = req.body;

        // Kiểm tra đã tồn tại follow chưa
        const existingFollow = await prisma.follow.findFirst({
            where: {
                follower_id: BigInt(follower_id),
                following_id: BigInt(following_id)
            }
        });

        if (existingFollow) {
            return res.status(409).json({ message: 'User is already following this user.' });
        }

        const newFollow = await prisma.follow.create({ 
            data: {
                follower_id: BigInt(follower_id),
                following_id: BigInt(following_id)
            }
        });

        // Tạo notification cho người được follow
        await prisma.notifications.create({
            data: {
                user_id: BigInt(following_id),
                type: 'follow',
                content: `User ${follower_id} đã theo dõi bạn.`,
                is_read: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            }
        });

        res.status(201).json(serialize(newFollow));
    } catch (error) {
        res.status(400).json({ message: 'Error creating follow', error });
    }
};

exports.updateFollow = async (req, res) => {
    try {
        const updatedFollow = await prisma.follow.update({
            where: { id: BigInt(req.params.id) },
            data: req.body
        });
        res.status(200).json(serialize(updatedFollow));
    } catch (error) {
        res.status(400).json({ message: 'Error updating follow', error });
    }
};

exports.deleteFollow = async (req, res) => {
    try {
        await prisma.follow.delete({ where: { id: BigInt(req.params.id) } });
        res.status(200).json({ message: 'Follow deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting follow', error });
    }
};

exports.unfollow = async (req, res) => {
    try {
        const { follower_id, following_id } = req.body;

        const existingFollow = await prisma.follow.findFirst({
            where: {
                follower_id: BigInt(follower_id),
                following_id: BigInt(following_id)
            }
        });

        if (!existingFollow) {
            return res.status(404).json({ message: 'Follow relationship not found.' });
        }

        await prisma.follow.delete({
            where: { id: existingFollow.id }
        });

        res.status(200).json({ message: 'Unfollowed successfully.' });
    } catch (error) {
        res.status(500).json({ message: 'Error unfollowing user', error });
    }
};

exports.getFollowStats = async (req, res) => {
    try {
        const userId = BigInt(req.params.userId);

        // Số người user này đang follow
        const followingCount = await prisma.follow.count({
            where: { follower_id: userId }
        });

        // Số người đang follow user này
        const followerCount = await prisma.follow.count({
            where: { following_id: userId }
        });

        res.status(200).json(serialize({
            userId,
            followingCount,
            followerCount
        }));
    } catch (error) {
        res.status(500).json({ message: 'Error fetching follow stats', error });
    }
};
