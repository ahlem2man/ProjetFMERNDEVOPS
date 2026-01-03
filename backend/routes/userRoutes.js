const express = require("express");
const router = express.Router();
const User = require("../models/User");
const { protect, isAdmin } = require("../middleware/authMiddleware");

// 1. Obtenir tous les utilisateurs (pour que l'admin puisse les voir et les modifier)
router.get("/", protect, isAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// 2. Changer le rôle d'un utilisateur (Action corrigée)
router.put('/:id/role', protect, isAdmin, async (req, res) => {
  try {
    const { role } = req.body;

    // Sécurité : on vérifie que le rôle est valide
    if (!['member', 'admin'].includes(role)) {
      return res.status(400).json({ message: "Rôle invalide" });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { role }, 
      { new: true }
    ).select('-password');
    
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors du changement" });
  }
});

module.exports = router;