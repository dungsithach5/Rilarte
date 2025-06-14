const { Comment }= require('../models');
exports.getAllComments = async (req, res) => {
    try {
        const comments = await Comment.findAll();
        res.status(200).json(comments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comments', error });
    }
};

exports.getCommentById = async (req, res) => {
    try {
        const comment = await Comment.findByPk(req.params.id);
        if (!product) {
            return res.status(404).json({ message: 'Comment not found' });
        }
        res.status(200).json(comment);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching comment', error });
    }
};

exports.createComment = async (req, res) => {
    try {
        const newComment = await Comment.create(req.body);
        res.status(201).json(newComment);
    } catch (error) {
        res.status(400).json({ message: 'Error creating comment', error });
    }
};

exports.updateComment = async (req, res) => {
    try {
        const [updatedRows] = await Comment.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        const updatedComment = await Comment.findByPk(req.params.id);
        res.status(200).json(updatedComment);
    } catch (error) {
        res.status(400).json({ message: 'Error updating comment', error });
    }
};

exports.deleteComment = async (req, res) => {
    try {
        const deletedRows = await Comment.destroy({
            where: { id: req.params.id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Comment not found' });
        }

        res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting comment', error });
    }
};