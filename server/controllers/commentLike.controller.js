const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Like a comment
const likeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user.id;

    // Check if comment exists
    const comment = await prisma.comments.findUnique({
      where: { id: parseInt(comment_id) }
    });

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user already liked this comment
    const existingLike = await prisma.comment_likes.findFirst({
      where: {
        user_id: user_id,
        comment_id: parseInt(comment_id)
      }
    });

    if (existingLike) {
      return res.status(400).json({ message: 'Comment already liked by this user' });
    }

    // Create like
    const like = await prisma.comment_likes.create({
      data: {
        user_id: user_id,
        comment_id: parseInt(comment_id)
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar_url: true
          }
        }
      }
    });

    // Tạo notification cho chủ comment
    if (comment.user_id !== user_id) {
      // Lấy username của user like
      const likeUser = await prisma.users.findUnique({
        where: { id: user_id },
        select: { username: true, avatar_url: true }
      });
      
      const notification = await prisma.notifications.create({
        data: {
          user_id: comment.user_id,
          type: 'comment_like',
          content: `đã thích bình luận của bạn`,
          related_user_id: user_id,
          related_comment_id: parseInt(comment_id),
          is_read: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      });

      // Emit notification via WebSocket
      if (global.emitNotification) {
        global.emitNotification(comment.user_id, {
          id: notification.id,
          type: notification.type,
          content: notification.content,
          is_read: notification.is_read,
          createdAt: notification.createdAt,
          related_user_id: notification.related_user_id,
          related_comment_id: notification.related_comment_id
        });
      }
    }

    res.status(201).json({
      message: 'Comment liked successfully',
      like
    });

  } catch (error) {
    console.error('Error liking comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Unlike a comment
const unlikeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user.id;

    // Check if like exists
    const existingLike = await prisma.comment_likes.findFirst({
      where: {
        user_id: user_id,
        comment_id: parseInt(comment_id)
      }
    });

    if (!existingLike) {
      return res.status(404).json({ message: 'Like not found' });
    }

    // Delete like
    await prisma.comment_likes.delete({
      where: {
        id: existingLike.id
      }
    });

    res.json({ message: 'Comment unliked successfully' });

  } catch (error) {
    console.error('Error unliking comment:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Get likes for a comment
const getCommentLikes = async (req, res) => {
  try {
    const { comment_id } = req.params;

    const likes = await prisma.comment_likes.findMany({
      where: {
        comment_id: parseInt(comment_id)
      },
      include: {
        users: {
          select: {
            id: true,
            username: true,
            avatar_url: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.json({
      count: likes.length,
      likes
    });

  } catch (error) {
    console.error('Error getting comment likes:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Check if user liked a comment
const checkUserLikeComment = async (req, res) => {
  try {
    const { comment_id } = req.params;
    const user_id = req.user.id;

    const like = await prisma.comment_likes.findFirst({
      where: {
        user_id: user_id,
        comment_id: parseInt(comment_id)
      }
    });

    res.json({
      isLiked: !!like,
      like
    });

  } catch (error) {
    console.error('Error checking user like:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  likeComment,
  unlikeComment,
  getCommentLikes,
  checkUserLikeComment
}; 