const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPosts = async (req, res) => {
  try {
    const { search, user_id } = req.query;
    const keyword = typeof search === 'string' ? search : '';

    let where = {};

    // Nếu có user_id, filter theo user_id
    if (user_id) {
      where.user_id = Number(user_id);
    }

    // Nếu có search keyword, thêm điều kiện search
    if (keyword) {
      const searchCondition = {
        OR: [
          { user_name: { contains: keyword } },
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      };
      
      // Combine với user_id nếu có
      if (user_id) {
        where = {
          ...where,
          ...searchCondition
        };
      } else {
        where = searchCondition;
      }
    }

    const posts = await prisma.posts.findMany({
      where,
      select: {
        id: true,
        user_id: true,
        user_name: true,
        title: true,
        content: true,
        image_url: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

      const postsWithTags = await Promise.all(
      posts.map(async post => {
        const postTags = await prisma.post_tags.findMany({
          where: { post_id: post.id },
          include: {
            tag: true,
          },
        });

        const tags = postTags.map(pt => pt.tag.name);
        return { ...post, tags };
      })
    );

    res.status(200).json(postsWithTags);
  } catch (error) {
    console.error("Error fetching posts:", error);
    res.status(500).json({
      message: 'Error fetching posts',
      error: error.message || 'Unknown error',
    });
  }
};

exports.getPostById = async (req, res) => {
  try {
      const post = await prisma.posts.findUnique({
        where: { id: Number(req.params.id) },
        include: {
          postTags: {
            include: {
              tag: true,
            },
          },
        },
      });

      if (!post) {
          return res.status(404).json({ message: 'Post not found' });
      }

      const tags = post.postTags.map(pt => pt.tag.name);
      const postWithTags = {
        ...post,
        tags,
      };
      delete postWithTags.postTags;

      res.status(200).json(postWithTags);
  } catch (error) {
      res.status(500).json({ message: 'Error fetching post', error });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { user_name, title, content, image_url, tags = [] } = req.body;

    // Validate required fields
    if (!user_name || !title || !content) {
      return res.status(400).json({ 
        message: 'Missing required fields: user_name, title, content',
        received: { user_name, title, content }
      });
    }

    // Find user by email (user_name contains email from frontend)
    const user = await prisma.users.findUnique({
      where: { email: user_name }
    });

    if (!user) {
      return res.status(400).json({ 
        message: 'User not found with email: ' + user_name,
        suggestion: 'Please make sure the user is registered in the system'
      });
    }

    console.log('Creating post for user:', { id: user.id, email: user.email, username: user.username });

    const newPost = await prisma.posts.create({
      data: {
        user_id: user.id,
        user_name: user.username || user.email, // Use username if available, otherwise email
        title,
        content,
        image_url: image_url || '',
        createdAt: new Date(),
        updatedAt: new Date(),
        postTags: {
          create: tags.map(tag => ({
            tag: {
              connectOrCreate: {
                where: { name: tag },
                create: { name: tag },
              },
            },
          })),
        },
      },
      include: {
        postTags: {
          include: { tag: true },
        },
      },
    });

    console.log('Post created successfully:', { id: newPost.id, title: newPost.title });
    res.status(201).json(newPost);
  } catch (error) {
    console.error('Error creating post with tags:', error);
    res.status(400).json({ 
      message: 'Error creating post', 
      error: error.message,
      details: error.code ? `Database error: ${error.code}` : 'Unknown error'
    });
  }
};

exports.updatePost = async (req, res) => {
    try {
        const { tags, ...postData } = req.body;
        const postId = Number(req.params.id);

        const existingPost = await prisma.posts.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!existingPost) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const updatedPost = await prisma.posts.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });

        if (tags && Array.isArray(tags)) {
          await prisma.post_tags.deleteMany({
            where: { post_id: postId }
          });
    
          for (const tagName of tags) {
            await prisma.post_tags.create({
              data: {
                post_id: postId,
                tag: {
                  connectOrCreate: {
                    where: { name: tagName },
                    create: { name: tagName },
                  },
                },
              },
            });
          }
        }
        res.status(200).json(updatedPost);
    } catch (error) {
        res.status(400).json({ message: 'Error updating post', error });
    }
};

exports.deletePost = async (req, res) => {
  try {
    const deletedPost = await prisma.posts.delete({
      where: { id: Number(req.params.id) }
    });
    if (!deletedPost) {
      return res.status(404).json({ message: 'Post not found' });
    }
    res.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({ message: 'Error deleting post', error });
  }
};
