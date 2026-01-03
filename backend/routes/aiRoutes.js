const express = require("express");
const router = express.Router();
const { generateDescription } = require("../controllers/aiController");
const { protect } = require("../middleware/authMiddleware");

// Route protégée : seul un utilisateur connecté peut l'utiliser [cite: 48]
router.post("/generate-description", protect, generateDescription);

module.exports = router;