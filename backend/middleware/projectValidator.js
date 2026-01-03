const { body } = require("express-validator");

exports.projectValidator = [
  body("title").notEmpty().withMessage("Titre du projet obligatoire"),
];
