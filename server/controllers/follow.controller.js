const { Follow } = require('../models');

exports.getAllFollows = async (req, res) => {
    try {
        const follows = await Follow.findAll();
        res.status(200).json(follows);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching follows', error });
    }
};

exports.getFollowById = async (req, res) => {
    try {
        const follow = await Follow.findByPk(req.params.id);
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
        const newFollow = await Follow.create(req.body);
        res.status(201).json(newFollow);
    } catch (error) {
        res.status(400).json({ message: 'Error creating follow', error });
    }
};

exports.updateFollow = async (req, res) => {
    try {
        const [updatedRows] = await Follow.update(req.body, {
            where: { id: req.params.id }
        });

        if (updatedRows === 0) {
            return res.status(404).json({ message: 'Follow not found' });
        }

        const updatedFollow = await Follow.findByPk(req.params.id);
        res.status(200).json(updatedFollow);
    } catch (error) {
        res.status(400).json({ message: 'Error updating follow', error });
    }
};

exports.deleteFollow = async (req, res) => {
    try {
        const deletedRows = await Follow.destroy({
            where: { id: req.params.id }
        });

        if (deletedRows === 0) {
            return res.status(404).json({ message: 'Follow not found' });
        }

        res.status(200).json({ message: 'Follow deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting follow', error });
    }
};
