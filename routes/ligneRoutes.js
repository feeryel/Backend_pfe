const express = require("express");
const router = express.Router();
const controller = require("../controllers/ligneController");
const auth = require("../middleware/auth");

router.post("/",auth, controller.create);
router.get("/",auth, controller.getAll);
router.delete("/:id",auth, controller.delete);
router.put("/:id",auth, controller.update);
router.get("/:id",auth, controller.getOne);

module.exports = router;