const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { User, Client } = require("../models");
const mailService = require("../services/mailService");
const auditService = require("../services/auditService");

const PASSWORD_CHARS = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

function generateRandomPassword(length = 10) {
  let password = "";
  for (let i = 0; i < length; i++) {
    password += PASSWORD_CHARS[crypto.randomInt(PASSWORD_CHARS.length)];
  }
  return password;
}

exports.register = async (req, res) => {
  const { login, motDePasse, role } = req.body;

  const hashed = await bcrypt.hash(motDePasse, 10);

  const user = await User.create({
    login,
    motDePasse: hashed,
    role
  });

  res.json(user);
};

exports.login = async (req, res) => {
  const { login, motDePasse } = req.body;

  const user = await User.findOne({ where: { login } });

  if (!user) return res.status(401).json({ message: "Identifiants incorrects" });

  const match = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!match) return res.status(401).json({ message: "Identifiants incorrects" });

  if (user.bannit) return res.status(403).json({ message: "Compte banni" });
  if (!user.actif)  return res.status(403).json({ message: "Compte désactivé" });

  const tokenPayload = { id: user.id, role: user.role, login: user.login };
  const response = {
    token:  null,
    role:   user.role,
    userId: user.id,
    login:  user.login
  };

  if (user.role === "client") {
    const clientProfile = await Client.findOne({ where: { userId: user.id } });
 if (clientProfile) {
      tokenPayload.clientId = clientProfile.id;
      response.clientId = clientProfile.id;
      response.clientName = clientProfile.nom;
    }
  }

  response.token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "secretkey");

  res.json(response);
};

// Changement de mot de passe par l'utilisateur connecté
exports.changePassword = async (req, res) => {
  try {
    const { ancienMotDePasse, nouveauMotDePasse } = req.body;

    if (!ancienMotDePasse || !nouveauMotDePasse) {
      return res.status(400).json({ message: "Tous les champs sont requis." });
    }

    if (nouveauMotDePasse.length < 6) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 6 caractères." });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    const match = await bcrypt.compare(ancienMotDePasse, user.motDePasse);
    if (!match) return res.status(401).json({ message: "Ancien mot de passe incorrect" });

    user.motDePasse = await bcrypt.hash(nouveauMotDePasse, 10);
    await user.save();

    auditService.logAction({
      userId: user.id,
      userLogin: user.login,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      details: { login: user.login, action: "change_password" }
    });

    res.json({ message: "Mot de passe modifié avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Mot de passe oublié — génère un nouveau mot de passe et l'envoie par email
exports.forgotPassword = async (req, res) => {
  try {
    const { login } = req.body;

    if (!login) {
      return res.status(400).json({ message: "Email requis." });
    }

    const user = await User.findOne({ where: { login } });

    if (user) {
      const newPassword = generateRandomPassword();
      user.motDePasse = await bcrypt.hash(newPassword, 10);
      await user.save();

      try {
        const mailQueue = require("../services/mailQueue");
        await mailQueue.addMailJob({ type: "password_reset", to: login, login, motDePasse: newPassword });
      } catch (err) {
        console.error("Impossible d'enfiler le job mail, fallback direct:", err);
        mailService.sendPasswordResetEmail({ to: login, login, motDePasse: newPassword })
          .catch(e => console.error("Erreur envoi email (fallback):", e));
      }

      auditService.logAction({
        userId: user.id,
        userLogin: user.login,
        action: "UPDATE",
        entity: "User",
        entityId: user.id,
        details: { login: user.login, action: "forgot_password" }
      });
    }

    // Réponse générique pour ne pas révéler si le compte existe
    res.json({ message: "Si ce compte existe, un nouveau mot de passe a été envoyé par email." });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
