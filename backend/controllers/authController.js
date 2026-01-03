const User = require("../models/User");
const Profile = require("../models/Profile");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Générer un token JWT
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
};

// REGISTER
exports.register = async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Utilisateur déjà existant" });

    // Hash du mot de passe
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Créer l'utilisateur
    const user = await User.create({
      email,
      password: hashedPassword,
    });

    // Créer le profil (1-to-1)
    await Profile.create({
      user: user._id,
      firstName,
      lastName,
    });

    res.status(201).json({
      message: "Utilisateur créé avec succès",
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Email ou mot de passe incorrect" });

    // --- CORRECTION ICI ---
    // On renvoie l'objet user pour que le frontend puisse faire setUser(res.data.user)
    res.json({
      message: "Connexion réussie",
      token: generateToken(user._id),
      user: {
        id: user._id,
        email: user.email,
        role: user.role // Important pour tes redirections
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};