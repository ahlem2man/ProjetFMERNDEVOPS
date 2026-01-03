const Profile = require("../models/Profile");

// RÉCUPÉRER le profil (READ) 
exports.getProfile = async (req, res) => {
  try {
    // On cherche le profil lié à l'utilisateur connecté via le token JWT
    const profile = await Profile.findOne({ user: req.user.id }).populate("user", "email role");
    
    if (!profile) return res.status(404).json({ message: "Profil non trouvé" });
    
    res.json(profile);
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// METTRE À JOUR le profil (UPDATE) 
exports.updateProfile = async (req, res) => {
  try {
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user.id },
      req.body,
      { new: true }
    );
    res.json(updatedProfile);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la mise à jour" });
  }
};