const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
exports.getAllComments = async (req, res) => {
    try {
        const comments = await prisma.comment.findMany();
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error });
    }
};

exports.getCommentById = async (req, res) => {
    try {
        const comment = await prisma.comment.findUnique({ where: { id: Number(req.params.id) } });
        if (!comment) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comment', error });
    }
};

exports.createComment = async (req, res) => {
    try {
        const newComment = await prisma.comment.create({ data: req.body });
        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating comment', error });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const updatedComment = await prisma.comment.update({
            where: { id: Number(req.params.id) },
            data: req.body
        });
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(400).json({ message: 'Error updating comment', error });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        await prisma.comment.delete({ where: { id: Number(req.params.id) } });
        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error });
    }
};