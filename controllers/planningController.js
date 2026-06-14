const { Planning, Demande, User } = require("../models");
const auditService = require("../services/auditService");

const includes = [
  Demande,
  { model: User, as: "responsable", attributes: ["id", "login"] },
  { model: User, as: "technicien", attributes: ["id", "login"] }
];

exports.create = async (req, res) => {
  try {
    // ✅ Accepte demandeId (MCP) OU DemandeReparationId (frontend Angular)
    const demandeRef = req.body.demandeId || req.body.DemandeReparationId;

    const data = await Planning.create({
      description:         req.body.description,
      dateDebut:           req.body.dateDebut,
      dateFin:             req.body.dateFin,
      statut:              req.body.statut,
      technicienId:        req.body.technicienId,
      DemandeReparationId: demandeRef,
      responsableId:       req.body.responsableId
    });

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "CREATE",
      entity: "Planning",
      entityId: data.id,
      details: { description: data.description, technicienId: data.technicienId }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await Planning.findByPk(req.params.id, { include: includes });

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Planning.findAll({ include: includes });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Plannings assignés à un technicien donné (espace technicien)
exports.getByTechnicien = async (req, res) => {
  try {
    const data = await Planning.findAll({
      where: { technicienId: req.params.technicienId },
      include: includes
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Planning.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    // ✅ Accepte demandeId (MCP) OU DemandeReparationId (frontend Angular)
    const demandeRef = req.body.demandeId || req.body.DemandeReparationId;

    await data.update({
      description:         req.body.description,
      dateDebut:           req.body.dateDebut,
      dateFin:             req.body.dateFin,
      statut:              req.body.statut,
      technicienId:        req.body.technicienId,
      DemandeReparationId: demandeRef,
      responsableId:       req.body.responsableId
    });

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "UPDATE",
      entity: "Planning",
      entityId: data.id,
      details: { description: data.description, statut: data.statut }
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
  }
};

// ✅ Le technicien met à jour uniquement le statut de SON planning
exports.updateStatut = async (req, res) => {
  try {
    const data = await Planning.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    if (data.technicienId !== req.user.id) {
      return res.status(403).json({ message: "Ce planning ne vous est pas assigné" });
    }

    const allowed = ["PLANIFIE", "EN_COURS", "TERMINE"];
    if (!allowed.includes(req.body.statut)) {
      return res.status(400).json({ message: "Statut invalide" });
    }

    await data.update({ statut: req.body.statut });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await Planning.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.destroy();

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "DELETE",
      entity: "Planning",
      entityId: req.params.id
    });

    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};
