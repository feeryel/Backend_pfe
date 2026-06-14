const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/devisController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

router.post(
  "/reparation/:reparationId",
  auth, active, role(["responsable_reparation"]),
  ctrl.create
);

router.get(
  "/reparation/:reparationId",
  auth, active, role(["responsable_reparation", "technicien", "reception", "client"]),
  ctrl.getByReparation
);

module.exports = router;
