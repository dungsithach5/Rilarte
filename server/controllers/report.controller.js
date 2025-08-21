const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Helper to serialize BigInt values safely to JSON (as strings)
const serialize = (data) => {
  return JSON.parse(
    JSON.stringify(data, (_, value) => (typeof value === 'bigint' ? value.toString() : value))
  );
};

exports.getAllReports = async (req, res) => {
  try {
    const reports = await prisma.report_posts.findMany({
      include: {
        posts: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    res.status(200).json(serialize(reports));
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ message: 'Error fetching reports', error });
  }
};

exports.getReportById = async (req, res) => {
  try {
    const report = await prisma.report_posts.findUnique({
      where: { id: BigInt(req.params.id) },
      include: {
        posts: true,
      },
    });

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json(serialize(report));
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ message: 'Error fetching report', error });
  }
};

exports.createReport = async (req, res) => {
  const { post_id, reason } = req.body;

  if (!post_id || !reason) {
    return res.status(400).json({ message: 'Missing post_id or reason' });
  }

  const posts = await prisma.posts.findUnique({
    where: { id: BigInt(post_id) },
    select: { user_id: true },
  });

  try {
    const report = await prisma.report_posts.create({
      data: {
        post_id: BigInt(post_id),
        user_id: posts.user_id,
        reason,
        reporter_id: BigInt(req.user.id),
      },
    });

    res.status(201).json(serialize({ message: 'Report submitted successfully', report }));
  } catch (error) {
    console.error('Error creating report:', error);
    res.status(500).json({ message: 'Error creating report', error });
  }
};

exports.updateReport = async (req, res) => {
  try {
    const reportId = BigInt(req.params.id);

    const updatedReport = await prisma.report_posts.update({
      where: { id: reportId },
      data: req.body,
    });

    res.status(200).json(serialize(updatedReport));
  } catch (error) {
    console.error('Error updating report:', error);

    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(500).json({ message: 'Error updating report', error });
  }
};

exports.deleteReport = async (req, res) => {
  try {
    await prisma.report_posts.delete({
      where: { id: BigInt(req.params.id) },
    });

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Error deleting report', error });
  }
};
