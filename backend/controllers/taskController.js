const Task = require("../models/Task");
const Project = require("../models/Project");

// --- LIRE les tâches d'un projet ---
exports.getTasksByProject = async (req, res) => {
  try {
    const { projectId } = req.query; 
    if (!projectId) return res.status(400).json({ message: "ID du projet manquant" });

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    const userId = req.user._id.toString();
    const isMember = project.members.some((id) => id.toString() === userId);
    const isOwner = project.owner.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    if (!isMember && !isOwner && !isAdmin) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const tasks = await Task.find({ project: projectId }).populate("assignedTo", "email");
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- CRÉER une tâche ---
exports.createTask = async (req, res) => {
  try {
    const { title, description, priority, dueDate, assignedTo, projectId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    const userId = req.user._id.toString();
    const isOwner = project.owner.toString() === userId;
    const isAdmin = req.user.role === 'admin';

    // Seul le propriétaire ou l'admin peut créer des tâches (selon votre logique isProjectOwner)
    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Seul le propriétaire peut créer des tâches" });
    }

    const task = await Task.create({ 
      title, 
      description, 
      priority, 
      dueDate, 
      project: projectId, 
      assignedTo 
    });
    res.status(201).json(task);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// --- MISE À JOUR d'une tâche (Statut pour les membres) ---
exports.updateTask = async (req, res) => {
  try {
    // On peuple 'project' pour accéder à la liste des membres
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: "Tâche non trouvée" });

    const project = task.project;
    const userId = req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    const isOwner = project.owner.toString() === userId;
    const isMember = project.members.some(m => m.toString() === userId);

    // 1. Sécurité : L'utilisateur doit faire partie du projet
    if (!isAdmin && !isOwner && !isMember) {
      return res.status(403).json({ message: "Accès refusé : Vous n'êtes pas membre" });
    }

    // 2. Distinction des permissions
    if (isMember && !isAdmin && !isOwner) {
      // Membre simple : peut UNIQUEMENT changer le statut
      if (req.body.status) {
        task.status = req.body.status;
      } else {
        return res.status(403).json({ message: "Un membre ne peut modifier que le statut" });
      }
    } else {
      // Admin ou Propriétaire : Peuvent tout modifier
      Object.assign(task, req.body);
    }

    await task.save();
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SUPPRIMER une tâche ---
exports.deleteTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.id).populate('project');
    if (!task) return res.status(404).json({ message: "Tâche introuvable" });

    const isAdmin = req.user.role === 'admin';
    const isOwner = task.project.owner.toString() === req.user._id.toString();

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Seul le propriétaire peut supprimer une tâche" });
    }

    await Task.findByIdAndDelete(req.params.id);
    res.json({ message: "Tâche supprimée avec succès" });
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la suppression" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { taskId, commentId } = req.params;

    // 1. Vérification de la Tâche
    const task = await Task.findById(taskId);
    if (!task) {
      console.log("Tâche non trouvée:", taskId);
      return res.status(404).json({ message: "Tâche introuvable" });
    }

    // 2. Vérification du Commentaire dans le tableau
    // Utilisation de .id() qui est la méthode Mongoose pour les sous-documents
    const comment = task.comments.id(commentId);
    if (!comment) {
      console.log("Commentaire non trouvé dans la tâche:", commentId);
      return res.status(404).json({ message: "Commentaire introuvable" });
    }

    // 3. Vérification sécurisée de l'utilisateur (Évite le crash 500)
    if (!req.user) {
      return res.status(401).json({ message: "Utilisateur non identifié" });
    }

    // On récupère l'ID utilisateur de manière flexible (id ou _id)
    const requesterId = (req.user._id || req.user.id)?.toString();
    const commentAuthorId = comment.user?.toString();

    const isAuthor = commentAuthorId === requesterId;
    const isAdmin = req.user.role === 'admin';

    // 4. Vérification des permissions
    if (!isAuthor && !isAdmin) {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    // 5. Suppression et Sauvegarde
    task.comments.pull(commentId);
    await task.save();

    return res.json({ message: "Commentaire supprimé avec succès" });

  } catch (error) {
    // On log l'erreur exacte dans le terminal pour que vous puissiez la voir
    console.error("CRASH DU SERVEUR (deleteComment):", error);
    
    return res.status(500).json({ 
      message: "Erreur serveur interne", 
      details: error.message 
    });
  }
};