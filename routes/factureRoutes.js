const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/factureController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

const RECEPTION = ["reception"];
const CLIENT    = ["client"];

// Routes RECEPTION
router.get("/",                         auth, active, role(RECEPTION), ctrl.getAll);
router.get("/reparation/:reparationId", auth, active, role(RECEPTION), ctrl.getByReparation);
router.get("/:id",                      auth, active, role(RECEPTION), ctrl.getOne);
router.post("/",                        auth, active, role(RECEPTION), ctrl.create);
router.put("/:id",                      auth, active, role(RECEPTION), ctrl.update);
router.delete("/:id",                   auth, active, role(RECEPTION), ctrl.delete);

// Route CLIENT — factures liées à SES réparations uniquement
router.get("/client/:clientId",         auth, active, role(CLIENT),    ctrl.getByClientId);

module.exports = router;
