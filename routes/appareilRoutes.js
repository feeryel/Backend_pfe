const express = require("express");
const router = express.Router();
const controller = require("../controllers/appareilController");
const auth = require("../middleware/auth");

router.post("/",auth, controller.create);
router.get("/", auth,controller.getAll);
router.get("/:id", auth,controller.getOne);
router.get("/client/:clientId", auth,controller.getByClient );

router.put("/:id",auth, controller.update);
router.delete("/:id",auth, controller.delete);


module.exports = router;