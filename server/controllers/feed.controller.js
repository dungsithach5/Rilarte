const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getUserFeed = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Lấy topics user đã chọn
    const userTopics = await prisma.user_topics.findMany({
      where: { user_id: userId },
      include: { topic: true },
    });

    const topicNames = userTopics.map((ut) => ut.topic.name);

    // Lấy posts có tag match topic
    const posts = await prisma.posts.findMany({
      where: {
        postTags: {
          some: {
            tag: { name: { in: topicNames } },
          },
        },
      },
      include: {
        users: true,
        postTags: { include: { tag: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    res.json(posts);
  } catch (err) {
    console.error("Error fetching feed:", err);
    res.status(500).json({ error: "Failed to fetch feed" });
  }
};