const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllLikes = async (req, res) => {
    try {
        const likes = await prisma.like.findMany();
        res.status(200).json(likes);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching likes', error });
    }
};

exports.getLikeById = async (req, res) => {
    try {
        const like = await prisma.like.findUnique({ where: { id: Number(req.params.id) } });
        if (!like) {
            return res.status(404).json({ message: 'Like not found' });
        }
        res.status(200).json(like);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching like', error });
    }
};

exports.createLike = async (req, res) => {
    try {
        const newLike = await prisma.like.create({ data: req.body });
        res.status(201).json(newLike);
    } catch (error) {
        res.status(400).json({ message: 'Error creating like', error });
    }
};

exports.updateLike = async (req, res) => {
    try {
        const updatedLike = await prisma.like.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.status(200).json(updatedLike);
    } catch (error) {
        res.status(400).json({ message: 'Error updating like', error });
    }
};

exports.deleteLike = async (req, res) => {
    try {
        await prisma.like.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Like deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting like', error });
    }
};
