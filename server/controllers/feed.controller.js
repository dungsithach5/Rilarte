const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserFeed = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    console.time('Feed API Performance');

    // Lấy topics user đã chọn
    const userTopics = await prisma.user_topics.findMany({
      where: { user_id: userId },
      select: { topic_id: true }
    });
    const topicIds = userTopics.map((ut) => ut.topic_id);
    
    if (topicIds.length === 0) {
      console.log('No topics found for user, returning empty feed');
      console.timeEnd('Feed API Performance');
      return res.json([]);
    }

    // Lấy posts theo topics (dùng postTags thay vì post_topics)
    const posts = await prisma.posts.findMany({
      where: {
        postTags: { some: { tag_id: { in: topicIds } } },
      },
      select: {
        id: true,
        title: true,
        content: true,
        image_url: true,
        createdAt: true,
        updatedAt: true,
        user_id: true,
        users: {
          select: {
            id: true,
            username: true,
            avatar_url: true,
            image: true
          }
        },
        postTags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    console.timeEnd('Feed API Performance');
    console.log(`Feed loaded: ${posts.length} posts for user ${userId}`);
    
    res.json(posts);
  } catch (err) {
    console.error("Error fetching feed:", err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};