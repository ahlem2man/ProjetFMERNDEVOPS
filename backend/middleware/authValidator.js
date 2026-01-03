const { body } = require("express-validator");

exports.registerValidator = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Mot de passe minimum 6 caractères"),
  body("firstName").notEmpty().withMessage("Prénom obligatoire"),
  body("lastName").notEmpty().withMessage("Nom obligatoire"),
];

exports.loginValidator = [
  body("email").isEmail().withMessage("Email invalide"),
  body("password").notEmpty().withMessage("Mot de passe requis"),
];
