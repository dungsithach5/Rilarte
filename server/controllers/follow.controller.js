const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * GET /follows
 * Lấy tất cả quan hệ follow
 */
exports.getAllFollows = async (req, res) => {
  try {
    const follows = await prisma.follows.findMany();
    res.status(200).json(follows);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching follows', error });
  }
};

/**
 * GET /follows/:id
 * Lấy follow theo id
 */
exports.getFollowById = async (req, res) => {
  try {
    const follow = await prisma.follows.findUnique({
      where: { id: Number(req.params.id) }
    });

    if (!follow) {
      return res.status(404).json({ message: 'Follow not found' });
    }

    res.status(200).json(follow);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching follow', error });
  }
};

/**
 * POST /follows
 * Tạo follow mới
 */
exports.createFollow = async (req, res) => {
  try {
    const follower_id = Number(req.body.follower_id);
    const following_id = Number(req.body.following_id);

    if (!follower_id || !following_id) {
      return res.status(400).json({ message: 'Invalid follower_id or following_id' });
    }

    // Kiểm tra đã tồn tại follow chưa
    const existingFollow = await prisma.follows.findFirst({
      where: { follower_id, following_id }
    });

    if (existingFollow) {
      return res.status(409).json({ message: 'User is already following this user.' });
    }

    const newFollow = await prisma.follows.create({
      data: {
        follower_id,
        following_id,
      }
    });

    // Tạo notification cho người được follow
    await prisma.notifications.create({
    data: {
        user_id: following_id, // người được follow
        type: "follow",
        content: `User ${follower_id} đã theo dõi bạn.`,
        is_read: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    }
    });

    res.status(201).json(newFollow);
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Error creating follow', error });
  }
};

/**
 * PUT /follows/:id
 * Cập nhật follow (hiếm khi cần)
 */
exports.updateFollow = async (req, res) => {
  try {
    const updatedFollow = await prisma.follows.update({
      where: { id: Number(req.params.id) },
      data: req.body
    });
    res.status(200).json(updatedFollow);
  } catch (error) {
    res.status(400).json({ message: 'Error updating follow', error });
  }
};

/**
 * DELETE /follows/:followerId/:followingId
 * Unfollow (RESTful style)
 */
exports.deleteFollow = async (req, res) => {
  try {
    const followerId = Number(req.params.followerId);
    const followingId = Number(req.params.followingId);

    const follow = await prisma.follows.findFirst({
      where: { follower_id: followerId, following_id: followingId }
    });

    if (!follow) {
      return res.status(404).json({ message: 'Follow relationship not found.' });
    }

    await prisma.follows.delete({ where: { id: follow.id } });
    res.status(200).json({ message: 'Unfollowed successfully.' });
  } catch (error) {
    res.status(500).json({ message: 'Error unfollowing user', error });
  }
};

/**
 * POST /follows/unfollow
 * Unfollow (body params style)
 */
exports.unfollow = async (req, res) => {
  try {
    const follower_id = Number(req.body.follower_id);
    const following_id = Number(req.body.following_id);

    const existingFollow = await prisma.follows.findFirst({
      where: { follower_id, following_id }
    });

    if (!existingFollow) {
      return res.status(404).json({ message: 'Follow relationship not found.' });
    }

    await prisma.follows.delete({ where: { id: existingFollow.id } });

    res.status(200).json({ message: 'Unfollowed successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error unfollowing user', error });
  }
};

/**
 * GET /follows/stats/:userId
 * Lấy thống kê follow của 1 user
 */
exports.getFollowStats = async (req, res) => {
  try {
    const { userId } = req.params;

    const followersCount = await prisma.follows.count({
      where: { following_id: Number(userId) }, // ai follow user này
    });

    const followingCount = await prisma.follows.count({
      where: { follower_id: Number(userId) }, // user này follow ai
    });

    res.json({
      success: true,
      followers: followersCount,
      following: followingCount,
    });
  } catch (error) {
    console.error('Error getting follow stats:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};
