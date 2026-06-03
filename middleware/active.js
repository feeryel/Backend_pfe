const { User } = require("../models");

/**
 * Vérifie que le compte est actif et non banni.
 * Doit être placé APRÈS le middleware auth.js.
 */
module.exports = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: ["id", "actif", "bannit"]
    });

    if (!user) {
      return res.status(401).json({ message: "Compte introuvable" });
    }
    if (user.bannit) {
      return res.status(403).json({ message: "Compte banni" });
    }
    if (!user.actif) {
      return res.status(403).json({ message: "Compte désactivé" });
    }

    next();
  } catch (err) {
    return res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
