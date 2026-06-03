const { LigneReparation, Piece, Reparation } = require("../models");

exports.create = async (req, res) => {
  try {
    const data = await LigneReparation.create({
      quantite:     req.body.quantite,
      prixHT:       req.body.prixHT,
      ReparationId: req.body.ReparationId,
      PieceId:      req.body.PieceId
    });

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await LigneReparation.findAll({
      include: [Piece, Reparation]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Nouvelle méthode — filtre par ReparationId
exports.getByReparation = async (req, res) => {
  try {
    const data = await LigneReparation.findAll({
      where: { ReparationId: req.params.reparationId },
      include: [Piece]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await LigneReparation.findByPk(req.params.id, {
      include: [Piece, Reparation]
    });

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await LigneReparation.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.update(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await LigneReparation.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};
