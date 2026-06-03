const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/demandeController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

const READ_ROLES  = ["reception", "responsable_reparation", "technicien"];
const WRITE_ROLES = ["reception"];

router.get("/",                  auth, active, role(READ_ROLES),  ctrl.getAll);
router.get("/client/:clientId",  auth, active, role(READ_ROLES),  ctrl.getByClient);
router.get("/:id",               auth, active, role(READ_ROLES),  ctrl.getOne);
router.post("/",                 auth, active, role(WRITE_ROLES), ctrl.create);
router.put("/:id",               auth, active, role(WRITE_ROLES), ctrl.update);
router.delete("/:id",            auth, active, role(WRITE_ROLES), ctrl.delete);

module.exports = router;
