const express = require("express");
const router = express.Router();
const {
  getAllTopics,
  getTopicById,
  createTopic,
  updateTopic,
  deleteTopic,
  saveUserTopics
} = require("../controllers/topic.controller");

router
    .route("/")
    .get(getAllTopics)
    .post(createTopic);

router
    .route("/:id")
    .get(getTopicById)
    .put(updateTopic)
    .delete(deleteTopic);

router.post("/:id/topics", saveUserTopics);

module.exports = router;
