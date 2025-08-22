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

    if (!user_id) {
      return res.status(400).json({ 
        message: 'User ID is required' 
      });
    }

    const savedPosts = await prisma.saved_posts.findMany({
      where: {
        user_id: Number(user_id)
      },
      include: {
        post: {
          include: {
            postTags: {
              include: {
                tag: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data để match với format posts
    const transformedPosts = savedPosts.map(savedPost => {
      const post = savedPost.post;
      const tags = post.postTags.map(pt => pt.tag.name);
      
      return {
        id: post.id,
        user_id: post.user_id,
        user_name: post.user_name,
        title: post.title,
        content: post.content,
        image_url: post.image_url,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        tags,
        savedAt: savedPost.createdAt
      };
    });

    console.log(`Retrieved ${transformedPosts.length} saved posts for user ${user_id}`);
    res.status(200).json(transformedPosts);

  } catch (error) {
    console.error('Error getting saved posts:', error);
    res.status(500).json({ 
      message: 'Error getting saved posts', 
      error: error.message 
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