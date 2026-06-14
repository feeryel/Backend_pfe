const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/auditLogController");
const auth    = require("../middleware/auth");
const active  = require("../middleware/active");
const role    = require("../middleware/role");

const ADMIN = ["admin"];

router.get("/", auth, active, role(ADMIN), ctrl.getAll);

module.exports = router;
