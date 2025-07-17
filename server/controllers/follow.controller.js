const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllFollows = async (req, res) => {
    try {
        const follows = await prisma.follow.findMany();
        res.status(200).json(follows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching follows', error });
    }
};

exports.getFollowById = async (req, res) => {
    try {
        const follow = await prisma.follow.findUnique({ where: { id: Number(req.params.id) } });
        if (!follow) {
            return res.status(404).json({ message: 'Follow not found' });
        }
        res.status(200).json(follow);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching follow', error });
    }
};

exports.createFollow = async (req, res) => {
    try {
        const newFollow = await prisma.follow.create({ data: req.body });
        res.status(201).json(newFollow);
    } catch (error) {
        res.status(400).json({ message: 'Error creating follow', error });
    }
};

exports.updateFollow = async (req, res) => {
    try {
        const updatedFollow = await prisma.follow.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.status(200).json(updatedFollow);
    } catch (error) {
        res.status(400).json({ message: 'Error updating follow', error });
    }
};

exports.deleteFollow = async (req, res) => {
    try {
        await prisma.follow.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Follow deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting follow', error });
    }
};
