const express = require("express");
const router = express.Router();
const controller = require("../controllers/factureController");
const auth = require("../middleware/auth");

router.post("/",auth, controller.create);
router.get("/",auth, controller.getAll);
router.get("/reparation/:reparationId",auth, controller.getByReparation);

router.get("/:id",auth, controller.getOne);
router.put("/:id",auth, controller.update);
router.delete("/:id",auth, controller.delete);
module.exports = router;