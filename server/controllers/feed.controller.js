exports.getUserFeed = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);

    // Lấy topics user đã chọn
    const userTopics = await prisma.user_topics.findMany({
      where: { user_id: userId },
    });
    const topicIds = userTopics.map((ut) => ut.topic_id);

    // Lấy posts theo topics
    const posts = await prisma.posts.findMany({
      where: {
        post_topics: { some: { topic_id: { in: topicIds } } },
      },
      include: {
        users: true,
        post_topics: { include: { topics: true } },
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