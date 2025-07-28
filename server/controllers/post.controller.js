const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllPosts = async (req, res) => {
  try {
    const { search } = req.query;
    const keyword = typeof search === 'string' ? search : '';

    const where = keyword
      ? {
          OR: [
            { user_name: { contains: keyword } },
            { title: { contains: keyword } },
            { content: { contains: keyword } },
          ],
        }
      : {};

    const posts = await prisma.posts.findMany({
      where,
      select: {
        id: true,
        user_name: true,
        title: true,
        content: true,
        image_url: true,
      },
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error("Error fetching posts:", error); // Log chi tiết lỗi
    res.status(500).json({
      message: 'Error fetching posts',
      error: error.message || 'Unknown error',
    });
  }
};

exports.getPostById = async (req, res) => {
    try {
        const post = await prisma.posts.findUnique({
            where: { id: Number(req.params.id) }
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching post', error });
    }
};

exports.createPost = async (req, res) => {
    try {
        const newPost = await prisma.posts.create({
            data: {
                user_name: req.body.user_name,
                title: req.body.title,
                content: req.body.content,
                image_url: req.body.image_url,
                createdAt: new Date(),
                updatedAt: new Date(),
            },
        });

        res.status(201).json(newPost);
    } catch (error) {
        res.status(400).json({ message: 'Error creating post', error });
    }
};

exports.updatePost = async (req, res) => {
    try {
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
