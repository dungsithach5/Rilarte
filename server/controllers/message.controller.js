const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await prisma.message.findMany();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
};

exports.getMessageById = async (req, res) => {
    try {
        const message = await prisma.message.findUnique({ where: { id: Number(req.params.id) } });
        if (!message) {
            return res.status(404).json({ message: 'Message not found' });
        }
        res.status(200).json(message);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching message', error });
    }
};

exports.createMessage = async (req, res) => {
    try {
        const newMessage = await prisma.message.create({ data: req.body });
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ message: 'Error creating message', error });
    }
};

exports.updateMessage = async (req, res) => {
    try {
        const updatedMessage = await prisma.message.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(400).json({ message: 'Error updating message', error });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        await prisma.message.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message', error });
    }
};
