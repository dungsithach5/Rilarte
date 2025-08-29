const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Save a post
exports.savePost = async (req, res) => {
  try {
    const { user_id, post_id } = req.body;

    // Validate required fields
    if (!user_id || !post_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: user_id, post_id' 
      });
    }

    // Check if post is already saved
    const existingSave = await prisma.saved_posts.findUnique({
      where: {
        user_id_post_id: {
          user_id: Number(user_id),
          post_id: Number(post_id)
        }
      }
    });

    if (existingSave) {
      return res.status(409).json({ 
        message: 'Post already saved' 
      });
    }

    // Create saved post
    const savedPost = await prisma.saved_posts.create({
      data: {
        user_id: Number(user_id),
        post_id: Number(post_id),
        createdAt: new Date()
      }
    });

    console.log('Post saved:', { user_id, post_id });
    res.status(201).json({
      success: true,
      message: 'Post saved successfully',
      savedPost
    });

  } catch (error) {
    console.error('Error saving post:', error);
    res.status(500).json({ 
      message: 'Error saving post', 
      error: error.message 
    });
  }
};

// Unsave a post
exports.unsavePost = async (req, res) => {
  try {
    const { user_id, post_id } = req.body;

    // Validate required fields
    if (!user_id || !post_id) {
      return res.status(400).json({ 
        message: 'Missing required fields: user_id, post_id' 
      });
    }

    // Delete saved post
    const deletedSave = await prisma.saved_posts.delete({
      where: {
        user_id_post_id: {
          user_id: Number(user_id),
          post_id: Number(post_id)
        }
      }
    });

    console.log('Post unsaved:', { user_id, post_id });
    res.status(200).json({
      success: true,
      message: 'Post unsaved successfully'
    });

  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ 
        message: 'Saved post not found' 
      });
    }
    
    console.error('Error unsaving post:', error);
    res.status(500).json({ 
      message: 'Error unsaving post', 
      error: error.message 
    });
  }
};

// Get saved posts for a user
exports.getSavedPosts = async (req, res) => {
  try {
    const { user_id } = req.params;
    const { cursor, limit } = req.query;

    if (!user_id) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const take = Math.min(Number(limit) || 20, 50);

    // Parse cursor nếu có
    let parsedCursor = undefined;
    if (cursor) {
      const [createdAtStr, id] = cursor.split("|");
      parsedCursor = { createdAt: new Date(createdAtStr), id: Number(id) };
    }

    // Query saved_posts + include post
    const savedPosts = await prisma.saved_posts.findMany({
      where: { user_id: Number(user_id) },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: take + 1,
      ...(parsedCursor && {
        cursor: { id: parsedCursor.id },
        skip: 1,
      }),
      include: {
        post: {
          select: {
            id: true,
            user_id: true,
            user_name: true,
            title: true,
            content: true,
            image_url: true,
            dominant_color: true,
            download_protected: true,
            allow_download: true,
            watermark_enabled: true,
            watermark_text: true,
            watermark_position: true,
            license_type: true,
            license_description: true,
            createdAt: true,
            postTags: {
              include: { tag: true },
            },
          },
        },
      },
    });

    const hasNextPage = savedPosts.length > take;
    const pageItems = hasNextPage ? savedPosts.slice(0, -1) : savedPosts;

    // Map lại format giống getAllPosts
    const postsWithTags = pageItems.map((saved) => {
      const post = saved.post;
      const tags = post.postTags.map((pt) => pt.tag.name);
      return {
        ...post,
        tags,
        savedAt: saved.createdAt, // thời điểm user save
      };
    });

    const edges = postsWithTags.map((p) => ({
      node: p,
      cursor: `${p.createdAt.toISOString()}|${p.id}`,
    }));

    res.status(200).json({
      edges,
      pageInfo: {
        hasNextPage,
        endCursor: edges.length > 0 ? edges[edges.length - 1].cursor : null,
      },
      totalCount: await prisma.saved_posts.count({
        where: { user_id: Number(user_id) },
      }),
    });
  } catch (error) {
    console.error("Error getting saved posts:", error);
    res.status(500).json({
      message: "Error getting saved posts",
      error: error.message,
    });
  }
};

// Check if a post is saved by a user
exports.checkSavedPost = async (req, res) => {
  try {
    const { user_id, post_id } = req.params;

    const savedPost = await prisma.saved_posts.findUnique({
      where: {
        user_id_post_id: {
          user_id: Number(user_id),
          post_id: Number(post_id)
        }
      }
    });

    res.status(200).json({
      isSaved: !!savedPost
    });

  } catch (error) {
    console.error('Error checking saved post:', error);
    res.status(500).json({ 
      message: 'Error checking saved post', 
      error: error.message 
    });
  }
};