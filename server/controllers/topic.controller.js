const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllTopics = async (req, res) => {
  try {
    const topics = await prisma.topics.findMany({
      orderBy: { name: "asc" },
    });
    res.json(topics);
  } catch (err) {
    console.error("Error fetching topics:", err);
    res.status(500).json({ error: "Failed to fetch topics" });
  }
};

