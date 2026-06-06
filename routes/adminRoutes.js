const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/adminController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

router.get("/stats", auth, active, role(["admin"]), ctrl.getStats);

module.exports = router;
