const { Planning, Demande, User } = require("../models");

exports.create = async (req, res) => {
  try {
    // ✅ Accepte demandeId (MCP) OU DemandeReparationId (frontend Angular)
    const demandeRef = req.body.demandeId || req.body.DemandeReparationId;

    const data = await Planning.create({
      dateDebut:             req.body.dateDebut,
      dateFin:               req.body.dateFin,
      DemandeReparationId:   demandeRef,
      responsableId:         req.body.responsableId
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message, error: err });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await Planning.findByPk(req.params.id, {
      include: [
        Demande,
        { model: User, as: "responsable" }
      ]
    });

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
    const data = await Planning.findAll({
      include: [
        Demande,
        { model: User, as: "responsable" }
      ]
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await Planning.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    // ✅ Accepte demandeId (MCP) OU DemandeReparationId (frontend Angular)
    const demandeRef = req.body.demandeId || req.body.DemandeReparationId;

    await data.update({
      dateDebut:           req.body.dateDebut,
      dateFin:             req.body.dateFin,
      DemandeReparationId: demandeRef,
      responsableId:       req.body.responsableId
    });

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
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};
