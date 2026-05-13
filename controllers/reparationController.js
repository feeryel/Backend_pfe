const { Reparation, Demande, LigneReparation, Piece, Facture, User } = require("../models");

exports.create = async (req, res) => {
  try {
    const data = await Reparation.create({
      ...req.body,
      DemandeId: req.body.demandeId,
      technicienId: req.body.technicienId
    });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getPrice = async (req, res) => {
  const rep = await Reparation.findByPk(req.params.id, {
    include: Facture
  });

  res.json({
    reparationId: rep.id,
    prix: rep.Facture?.montantTotal || null,
    status: rep.Facture ? "FACTURED" : "NOT_READY"
  });
};

exports.getStatus = async (req, res) => {
  try {
    const rep = await Reparation.findByPk(req.params.id, {
  attributes: ["id", "status", "estReparable", "dateFinRep"]
});

    if (!rep) {
      return res.status(404).json({ message: "Reparation not found" });
    }

    res.json({
      id: rep.id,
      status: rep.status,
      estReparable: rep.estReparable,
      dateFinRep: rep.dateFinRep
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
exports.getOne = async (req, res) => {
  try {
    const data = await Reparation.findByPk(req.params.id, {
      include: [
        Demande,
        { model: User, as: "technicien" },
        {
          model: LigneReparation,
          include: [Piece]
        },
        Facture
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Reparation not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
exports.getAll = async (req, res) => {
  const data = await Reparation.findAll({
    include: [
      Demande,
      { model: User, as: "technicien" },
      {
        model: LigneReparation,
        include: [Piece]
      },
      Facture
    ]
  });

  res.json(data);
};
exports.update = async (req, res) => {
  try {
    const data = await Reparation.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.update(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const rep = await Reparation.findByPk(req.params.id);

    if (!rep) {
      return res.status(404).json({ message: "Reparation not found" });
    }

    rep.status = req.body.status; // DONE / IN_PROGRESS
    await rep.save();

    res.json({
      message: "Status updated",
      status: rep.status
    });

  } catch (err) {
    res.status(500).json(err);
  }
};
exports.delete = async (req, res) => {
  try {
    const data = await Reparation.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};