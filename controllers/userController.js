const { User } = require("../models");
const bcrypt    = require("bcrypt");
const mailService = require("../services/mailService");
const auditService = require("../services/auditService");

// Rôles que l'admin peut créer — CLIENT est exclu (créé uniquement par RECEPTION)
const CREATABLE_ROLES = ["admin", "technicien", "reception", "responsable_reparation", "achat_stock"];
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

exports.create = async (req, res) => {
  try {
    const { login, motDePasse, role } = req.body;

    if (!EMAIL_REGEX.test(login)) {
      return res.status(400).json({ message: "Le login doit être une adresse email valide." });
    }

    if (!CREATABLE_ROLES.includes(role)) {
      return res.status(400).json({
        message: `Rôle invalide. Autorisés : ${CREATABLE_ROLES.join(", ")}. Le rôle CLIENT est créé uniquement par la Réception.`
      });
    }

    const exists = await User.findOne({ where: { login } });
    if (exists) return res.status(409).json({ message: "Ce login est déjà utilisé." });

    const hashedPassword = await bcrypt.hash(motDePasse, 10);
    const user = await User.create({ login, motDePasse: hashedPassword, role });

    // Enfiler l'email dans la queue (Bull/Redis). Si la queue n'est pas disponible, fallback envoi direct asynchrone.
    try {
      const mailQueue = require('../services/mailQueue');
      const job = await mailQueue.addMailJob({ to: login, login, motDePasse, role });
      if (job) console.log('Mail job queued id=', job.id, 'for', login);
    } catch (err) {
      console.error('Impossible d\'enfiler le job mail, fallback direct:', err);
      mailService.sendUserCreatedEmail({ to: login, login, motDePasse, role })
        .then(()=>console.log(`Email de création envoyé à ${login} (fallback)`))
        .catch(e=>console.error('Erreur envoi email (fallback):', e));
    }

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "CREATE",
      entity: "User",
      entityId: user.id,
      details: { login: user.login, role: user.role }
    });

    res.status(201).json({
      id: user.id, login: user.login, role: user.role,
      actif: user.actif, bannit: user.bannit, createdAt: user.createdAt,
      emailQueued: true
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: ["id", "login", "role", "actif", "bannit", "createdAt"]
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id, {
      attributes: ["id", "login", "role", "actif", "bannit", "createdAt"]
    });
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getTechniciens = async (req, res) => {
  try {
    const techs = await User.findAll({
      where: { role: "technicien", actif: true, bannit: false },
      attributes: ["id", "login"]
    });
    res.json(techs);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });

    // Interdire de changer le rôle en CLIENT via update
    if (req.body.role === "client") {
      return res.status(400).json({ message: "Le rôle CLIENT est réservé à la Réception." });
    }

    const updates = { ...req.body };
    if (updates.motDePasse) {
      updates.motDePasse = await bcrypt.hash(updates.motDePasse, 10);
    }
    delete updates.actif;
    delete updates.bannit;

    await user.update(updates);

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      details: { login: user.login, role: user.role }
    });

    res.json({ id: user.id, login: user.login, role: user.role });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.desactiver = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Impossible de désactiver un administrateur." });
    }
    await user.update({ actif: false });

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      details: { login: user.login, actif: false }
    });

    res.json({ message: `Compte de ${user.login} désactivé.`, id: user.id, actif: false });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.reactiver = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    await user.update({ actif: true, bannit: false });

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      details: { login: user.login, actif: true, bannit: false }
    });

    res.json({ message: `Compte de ${user.login} réactivé.`, id: user.id, actif: true, bannit: false });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.bannir = async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: "Utilisateur non trouvé" });
    if (user.role === "admin") {
      return res.status(403).json({ message: "Impossible de bannir un administrateur." });
    }
    await user.update({ bannit: true, actif: false });

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "UPDATE",
      entity: "User",
      entityId: user.id,
      details: { login: user.login, bannit: true, actif: false }
    });

    res.json({ message: `Compte de ${user.login} banni.`, id: user.id, bannit: true, actif: false });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

// Suppression physique désactivée — utiliser desactiver/bannir
exports.delete = async (req, res) => {
  res.status(405).json({
    message: "La suppression est désactivée. Utilisez désactiver ou bannir."
  });
};
