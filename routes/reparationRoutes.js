const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/reparationController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

const RECEPTION_REP   = ["reception", "responsable_reparation"];
const TECH_REP        = ["technicien", "responsable_reparation"];
const TECH_REC_REP    = ["technicien", "reception", "responsable_reparation"];

// Liste globale (reception + responsable_reparation) — technicien filtered internally
router.get("/",                    auth, active, role(TECH_REC_REP),  ctrl.getAll);

// Réparations assignées au technicien connecté
router.get("/assigned",            auth, active, role(["technicien"]), ctrl.getAssigned);

// Réparations d'un client spécifique
router.get("/client/:clientId",    auth, active, role(["client", "reception"]), ctrl.getByClientId);

// Prix et statut
router.get("/:id/price",           auth, active, role(TECH_REC_REP),  ctrl.getPrice);
router.get("/:id/status",          auth, active, role(TECH_REC_REP),  ctrl.getStatus);
router.get("/:id",                 auth, active, role(TECH_REC_REP),  ctrl.getOne);

// Création (reparation uniquement)
router.post("/",                   auth, active, role(["responsable_reparation"]), ctrl.create);

// Mise à jour générale
router.put("/:id",                 auth, active, role(RECEPTION_REP), ctrl.update);

// Assignation technicien
router.patch("/:id/status",        auth, active, role(TECH_REP),      ctrl.updateStatus);

// Suppression
router.delete("/:id",              auth, active, role(["reception"]), ctrl.delete);

module.exports = router;
