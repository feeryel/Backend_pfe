const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/ligneController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

const READ_ROLES  = ["technicien", "responsable_reparation", "reception", "achat_stock"];
const WRITE_ROLES = ["technicien"];

router.get("/",                             auth, active, role(READ_ROLES),  ctrl.getAll);
router.get("/reparation/:reparationId",     auth, active, role(READ_ROLES),  ctrl.getByReparation);
router.get("/:id",                          auth, active, role(READ_ROLES),  ctrl.getOne);
router.post("/",                            auth, active, role(WRITE_ROLES), ctrl.create);
router.put("/:id",                          auth, active, role(WRITE_ROLES), ctrl.update);
router.delete("/:id",                       auth, active, role(WRITE_ROLES), ctrl.delete);

module.exports = router;
