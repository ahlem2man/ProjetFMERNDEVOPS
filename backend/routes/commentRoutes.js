const express = require("express");
const router = express.Router();
const {
  createComment,
  getCommentsByTask,
  deleteComment,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

router.use(protect);

router.post("/", createComment);
router.get("/task/:taskId", getCommentsByTask);
router.delete("/:id", deleteComment);

module.exports = router;
