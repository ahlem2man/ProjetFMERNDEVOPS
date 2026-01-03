const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");

const {
  registerValidator,
  loginValidator,
} = require("../middleware/authValidator");
const { validate } = require("../middleware/validateMiddleware");

// Routes avec validation (C'est la méthode recommandée)
router.post("/register", registerValidator, validate, register);
router.post("/login", loginValidator, validate, login);

module.exports = router;
