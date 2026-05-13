const router = require("express").Router();
const authController = require("../controllers/authController");

// Register user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

module.exports = router;