const express = require("express");
const router  = express.Router();
const ctrl    = require("../controllers/devisController");

router.get("/:token", ctrl.getPublicByToken);
router.post("/:token/respond", ctrl.respondPublic);

module.exports = router;
