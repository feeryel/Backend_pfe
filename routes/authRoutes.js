const router = require("express").Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const active = require("../middleware/active");

// Register user
router.post("/register", authController.register);

// Login user
router.post("/login", authController.login);

// Changement de mot de passe (utilisateur connecté)
router.patch("/change-password", auth, active, authController.changePassword);

// Mot de passe oublié
router.post("/forgot-password", authController.forgotPassword);

module.exports = router;