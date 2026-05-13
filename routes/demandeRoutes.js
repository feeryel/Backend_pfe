const express = require("express");
const router = express.Router();
const controller = require("../controllers/demandeController");
const auth = require("../middleware/auth");

router.post("/",auth, controller.create);
router.get("/",auth, controller.getAll);
router.get("/client/:clientId",auth, controller.getByClient);
router.get("/:id",auth, controller.getOne);
router.put("/:id",auth, controller.update);
router.delete("/:id",auth, controller.delete);
module.exports = router;