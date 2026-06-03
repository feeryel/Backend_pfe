const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/clientController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

const RECEPTION = ["reception"];

router.get("/",          auth, active, role(RECEPTION), ctrl.getAll);
router.get("/:id",       auth, active, role(RECEPTION), ctrl.getOne);
router.post("/",         auth, active, role(RECEPTION), ctrl.create);
router.put("/:id",       auth, active, role(RECEPTION), ctrl.update);
router.delete("/:id",    auth, active, role(RECEPTION), ctrl.delete);

module.exports = router;
