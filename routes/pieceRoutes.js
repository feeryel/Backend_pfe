const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/pieceController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

// Technicien peut lire pour sélectionner des pièces dans une réparation
const READ_ROLES  = ["achat_stock", "technicien"];
const WRITE_ROLES = ["achat_stock"];

router.get("/",      auth, active, role(READ_ROLES),  ctrl.getAll);
router.get("/:id",   auth, active, role(READ_ROLES),  ctrl.getOne);
router.post("/",     auth, active, role(WRITE_ROLES), ctrl.create);
router.put("/:id",   auth, active, role(WRITE_ROLES), ctrl.update);
router.delete("/:id",auth, active, role(WRITE_ROLES), ctrl.delete);

module.exports = router;
