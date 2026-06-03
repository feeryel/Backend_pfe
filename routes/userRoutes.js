const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/userController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

const ADMIN = ["admin"];
// Techniciens list accessible au responsable_reparation pour l'assignation
const ADMIN_OR_REP = ["admin", "responsable_reparation"];

router.post("/",                    auth, active, role(ADMIN),        ctrl.create);
router.get("/",                     auth, active, role(ADMIN),        ctrl.getAll);
router.get("/techniciens/list",     auth, active, role(ADMIN_OR_REP), ctrl.getTechniciens);
router.get("/:id",                  auth, active, role(ADMIN),        ctrl.getOne);
router.put("/:id",                  auth, active, role(ADMIN),        ctrl.update);
router.patch("/:id/desactiver",     auth, active, role(ADMIN),        ctrl.desactiver);
router.patch("/:id/reactiver",      auth, active, role(ADMIN),        ctrl.reactiver);
router.patch("/:id/bannir",         auth, active, role(ADMIN),        ctrl.bannir);
router.delete("/:id",               auth, active, role(ADMIN),        ctrl.delete);

module.exports = router;
