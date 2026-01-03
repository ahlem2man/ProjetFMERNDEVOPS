const Comment = require("../models/Comment");
const Task = require("../models/Task");
const Project = require("../models/Project");

// --- CRÉER un commentaire ---
exports.createComment = async (req, res) => {
  try {
    const { content, taskId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });

    const project = await Project.findById(task.project);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    // Vérification : Membre ou Admin
    const isMember = project.members.some((id) => id.toString() === req.user._id.toString());
    const isAdmin = req.user.role === 'admin';

    if (!isMember && !isAdmin) {
      return res.status(403).json({ message: "Accès refusé aux commentaires" });
    }

    const comment = await Comment.create({
      content,
      task: taskId,
      user: req.user._id,
    });

    await comment.populate("user", "email");
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// backend/controllers/commentController.js
exports.getCommentsByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    // On récupère TOUS les commentaires liés à cette tâche
    const comments = await Comment.find({ task: taskId })
      .populate("user", "email") // TRÈS IMPORTANT pour voir l'email de l'auteur
      .sort({ createdAt: 1 });   // Pour avoir l'ordre de la discussion

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// --- SUPPRIMER un commentaire ---
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params; 

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "Authentification requise" });
    }

    const isAuthor = comment.user.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';

    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await Comment.findByIdAndDelete(commentId);
    res.json({ message: "Commentaire supprimé avec succès" });

  } catch (error) {
    console.error("Erreur suppression:", error);
    res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};