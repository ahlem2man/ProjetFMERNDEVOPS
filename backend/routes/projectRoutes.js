const express = require("express");
const router = express.Router();
const projectCtrl = require("../controllers/projectController");
const { protect } = require("../middleware/authMiddleware");
const { projectValidator } = require("../middleware/projectValidator");
const { validate } = require("../middleware/validateMiddleware");

// 1. Protection globale : Toutes les routes ci-dessous nécessitent un token JWT
router.use(protect);

// 2. Route des statistiques (À mettre AVANT les routes avec :id pour éviter les conflits)
// Note : J'utilise projectCtrl car c'est le nom défini à la ligne 3
router.get("/stats/all", projectCtrl.getProjectStats);

// --- ROUTES STANDARDS ---
router.get("/", projectCtrl.getProjects);
router.get("/:id", projectCtrl.getProjectById);
router.post("/", projectValidator, validate, projectCtrl.createProject);
router.put("/:id", projectValidator, validate, projectCtrl.updateProject);
router.delete("/:id", projectCtrl.deleteProject);

// --- ROUTES MEMBRES ---
router.post("/:id/members", projectCtrl.addMember);
router.delete('/:id/members/:memberId', projectCtrl.removeMember);

module.exports = router;