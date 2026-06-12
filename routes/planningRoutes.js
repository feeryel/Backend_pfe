const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/planningController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

const READ_ROLES  = ["technicien", "responsable_reparation"];
const WRITE_ROLES = ["responsable_reparation"];

router.get("/",                      auth, active, role(READ_ROLES),  ctrl.getAll);
router.get("/technicien/:technicienId", auth, active, role(READ_ROLES),  ctrl.getByTechnicien);
router.get("/:id",                   auth, active, role(READ_ROLES),  ctrl.getOne);
router.post("/",                     auth, active, role(WRITE_ROLES), ctrl.create);
router.put("/:id",                   auth, active, role(WRITE_ROLES), ctrl.update);
router.patch("/:id/statut",          auth, active, role(["technicien"]), ctrl.updateStatut);
router.delete("/:id",                auth, active, role(WRITE_ROLES), ctrl.delete);

module.exports = router;
