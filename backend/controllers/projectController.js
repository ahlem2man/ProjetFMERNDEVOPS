const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");

// controllers/projectController.js - VERSION CORRIGÉE
exports.getProjectStats = async (req, res) => {
  try {
    const isAdmin = req.user.role === 'admin';
    const query = isAdmin ? {} : { members: req.user._id };

    const projects = await Project.find(query);
    const projectIds = projects.map(p => p._id);

    // On récupère toutes les tâches liées à ces projets
    const tasks = await Task.find({ project: { $in: projectIds } });

    // DEBUG : Décommentez la ligne suivante pour voir les vrais textes dans vos logs serveurs
    // console.log("Statuts réels en base :", tasks.map(t => t.status));

    res.json({
      projects: projects.length,
      tasks: tasks.length,
      // .toLowerCase() permet de matcher 'todo', 'Todo', 'TODO', etc.
      todo: tasks.filter(t => t.status?.toLowerCase() === 'todo').length,
      doing: tasks.filter(t => t.status?.toLowerCase() === 'doing').length,
      done: tasks.filter(t => t.status?.toLowerCase() === 'done').length,
      members: [...new Set(projects.flatMap(p => p.members))].length
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Erreur statistiques" });
  }
};

// --- LIRE TOUS LES PROJETS ---
exports.getProjects = async (req, res) => {
  try {
    let query = { members: req.user._id };
    if (req.user.role === 'admin') query = {}; 

    const projects = await Project.find(query)
      .populate("owner", "email")
      .populate("members", "email")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- LIRE UN PROJET PAR ID (Celle qui manquait !) ---
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "email")
      .populate("members", "email");

    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    // Sécurité : Accès si Admin ou si membre du projet
    const isMember = project.members.some(m => m._id.toString() === req.user._id.toString());
    if (req.user.role !== 'admin' && !isMember) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    res.json(project);
  } catch (error) {
    res.status(500).json({ message: "ID de projet invalide" });
  }
};

// projectController.js
exports.createProject = async (req, res) => {
  try {
    // BLOQUAGE STRICT : Seuls les admins créent des projets
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: "Seul l'administrateur peut créer un projet" });
    }

    const { title, description } = req.body;
    const project = await Project.create({
      title,
      description,
      owner: req.user._id,
      members: [req.user._id],
    });
    res.status(201).json(project);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- MODIFIER UN PROJET ---
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    // Seul l'owner ou l'admin peut modifier
    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    const updatedProject = await Project.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// --- SUPPRIMER UN PROJET ---
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    if (project.owner.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ message: "Action non autorisée" });
    }

    await Task.deleteMany({ project: req.params.id });
    await project.deleteOne();

    res.json({ message: "Projet supprimé" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// --- AJOUTER UN MEMBRE (Fonction manquante pour compléter le système) ---
exports.addMember = async (req, res) => {
  try {
    const { email } = req.body;
    const userToAdd = await User.findOne({ email });
    if (!userToAdd) return res.status(404).json({ message: "Utilisateur introuvable" });

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet introuvable" });

    // Éviter les doublons
    if (project.members.includes(userToAdd._id)) {
      return res.status(400).json({ message: "Déjà membre" });
    }

    project.members.push(userToAdd._id);
    await project.save();

    const updatedProject = await Project.findById(req.params.id)
      .populate("owner", "email")
      .populate("members", "email");
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de l'ajout" });
  }
};

// --- SUPPRIMER UN MEMBRE (Votre fonction avec correction de retour) ---
exports.removeMember = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Projet non trouvé" });

    // Retirer le membre
    project.members = project.members.filter(
      (m) => m.toString() !== req.params.memberId
    );

    await project.save();
    
    const updatedProject = await Project.findById(req.params.id)
      .populate("owner", "email")
      .populate("members", "email");
    res.json(updatedProject);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur lors de la suppression" });
  }
};