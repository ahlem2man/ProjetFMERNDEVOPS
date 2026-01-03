const express = require("express");
const router = express.Router();

// 1. On garde uniquement les fonctions liées aux tâches ici
const {
  createTask,
  getTasksByProject,
  updateTask,
  deleteTask
} = require("../controllers/taskController");

// 2. ON IMPORTE deleteComment depuis le COMMENT controller (très important !)
const { deleteComment } = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");
const { taskValidator } = require("../middleware/taskValidator");
const { validate } = require("../middleware/validateMiddleware");
const { isProjectOwner } = require("../middleware/isProjectOwner");
const { getCommentsByTask } = require("../controllers/commentController");
// 🔐 Sécurité
router.use(protect);

// 📄 Routes des tâches
router.get("/", getTasksByProject);
router.post("/", isProjectOwner, taskValidator, validate, createTask);
router.put("/:id", updateTask);
router.delete("/:id", isProjectOwner, deleteTask);

// 💬 Suppression de commentaire
// On utilise bien la fonction importée du commentController
router.delete("/:taskId/comments/:commentId", deleteComment);
router.get("/:taskId/comments", protect, getCommentsByTask);
module.exports = router;