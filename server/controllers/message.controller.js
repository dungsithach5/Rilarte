const { Message } = require('../models');

exports.getAllMessages = async (req, res) => {
    try {
        const messages = await Message.findAll();
        res.status(200).json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error });
    }
};

exports.getMessageById = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);
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
        const newMessage = await Message.create(req.body);
        res.status(201).json(newMessage);
    } catch (error) {
        res.status(400).json({ message: 'Error creating message', error });
    }
};

exports.updateMessage = async (req, res) => {
    try {
        const [updatedRows] = await Message.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        const updatedMessage = await Message.findByPk(req.params.id);
        res.status(200).json(updatedMessage);
    } catch (error) {
        res.status(400).json({ message: 'Error updating message', error });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        const deletedRows = await Message.destroy({
            where: { id: req.params.id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Message not found' });
        }

        res.status(200).json({ message: 'Message deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting message', error });
    }
};
