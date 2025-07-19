const express = require('express');
const router = express.Router();

const {
    getAllBannedWords,
    getBannedWordById,
    createBannedWord,
    updateBannedWord,
    deleteBannedWord,
} = require('../controllers/bannedKeywords.controller');

router
    .route('/')
    .get(getAllBannedWords)
    .post(createBannedWord);

router
    .route('/:id')
    .get(getBannedWordById)
    .put(updateBannedWord)
    .delete(deleteBannedWord);

module.exports = router;
