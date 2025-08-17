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

exports.createTopic = async (req, res) => {
  try {
    const { name, image_url } = req.body;
    if (!name) return res.status(400).json({ error: "Topic name is required" });

    const topic = await prisma.topics.create({
      data: { name, image_url },
    });

    res.status(201).json(topic);
  } catch (err) {
    console.error("Error creating topic:", err);
    res.status(500).json({ error: "Failed to create topic" });
  }
};

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

exports.getTopicById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const topic = await prisma.topics.findUnique({
      where: { id },
    });
    if (!topic) return res.status(404).json({ error: "Topic not found" });
    res.json(topic);
  } catch (err) {
    console.error("Error fetching topic:", err);
    res.status(500).json({ error: "Failed to fetch topic" });
  }
};


exports.updateTopic = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { name, image_url } = req.body;

    const topic = await prisma.topics.update({
      where: { id },
      data: { name, image_url },
    });

    res.json(topic);
  } catch (err) {
    console.error("Error updating topic:", err);
    res.status(500).json({ error: "Failed to update topic" });
  }
};

exports.deleteTopic = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await prisma.topics.delete({ where: { id } });
    res.json({ message: "Topic deleted successfully" });
  } catch (err) {
    console.error("Error deleting topic:", err);
    res.status(500).json({ error: "Failed to delete topic" });
  }
};

exports.saveUserTopics = async (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { topics } = req.body;

    const data = topics.map((topic_id) => ({ user_id: userId, topic_id }));
    await prisma.user_topics.createMany({ data });

    res.status(200).json({ message: "Topics saved" });
  } catch (err) {
    console.error("Error saving user topics:", err);
    res.status(500).json({ error: "Failed to save topics" });
  }
};