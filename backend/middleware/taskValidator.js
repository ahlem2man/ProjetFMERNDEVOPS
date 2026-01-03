const { body } = require("express-validator");

exports.taskValidator = [
  body("title")
    .if(body("title").exists()) // Ne valide que si le champ est présent (utile pour le PUT)
    .notEmpty()
    .withMessage("Titre de la tâche obligatoire"),
    
  body("projectId")
    .if((value, { req }) => req.method === 'POST') // Requis uniquement à la création
    .notEmpty()
    .withMessage("Project ID requis"),

  body("status")
    .optional()
    .isIn(["todo", "doing", "done"])
    .withMessage("Statut invalide"),

  body("priority")
    .optional()
    .isIn(["low", "medium", "high"])
    .withMessage("Priorité invalide"),
];