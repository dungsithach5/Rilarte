const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllBannedWords = async (req, res) => {
    try {
        const words = await prisma.banned_keywords.findMany();
        res.status(200).json(words);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching banned keywords', error });
    }
};

exports.getBannedWordById = async (req, res) => {
    try {
        const word = await prisma.banned_keywords.findUnique({
            where: { id: Number(req.params.id) }
        });
        if (!word) {
            return res.status(404).json({ message: 'Keyword not found' });
        }
        res.status(200).json(word);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching keyword', error });
    }
};

exports.createBannedWord = async (req, res) => {
    try {
        const newWord = await prisma.banned_keywords.create({
            data: req.body
        });
        res.status(201).json(newWord);
    } catch (error) {
        res.status(400).json({ message: 'Error creating banned keyword', error });
    }
};

exports.updateBannedWord = async (req, res) => {
    try {
        const updatedWord = await prisma.banned_keywords.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.status(200).json(updatedWord);
    } catch (error) {
        res.status(400).json({ message: 'Error updating banned keyword', error });
    }
};

exports.deleteBannedWord = async (req, res) => {
    try {
        await prisma.banned_keywords.delete({
            where: { id: Number(req.params.id) }
        });
        res.status(200).json({ message: 'Keyword deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting banned keyword', error });
    }
};
