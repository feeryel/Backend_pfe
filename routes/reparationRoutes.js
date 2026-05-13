const express = require("express");
const router = express.Router();
const controller = require("../controllers/reparationController");
const auth = require("../middleware/auth");

router.post("/",auth, controller.create);
router.get("/",auth, controller.getAll);
router.get("/:id/price",auth, controller.getPrice);
router.get("/:id/status",auth, controller.getStatus);

router.get("/:id",auth, controller.getOne);
router.put("/:id",auth, controller.update);
router.put("/:id/status", auth, controller.updateStatus);

router.delete("/:id",auth, controller.delete);

module.exports = router;