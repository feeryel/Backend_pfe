const { Facture, Reparation, Appareil, Client, LigneReparation, Piece } = require("../models");
const DemandeReparation = require("../models/DemandeReparation");

exports.create = async (req, res) => {
  try {
    const data = await Facture.create({
      ...req.body,
      ReparationId: req.body.ReparationId
    });

    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.getByReparation = async (req, res) => {
  const data = await Facture.findOne({
    where: { ReparationId: req.params.reparationId }
  });

  res.json(data);
};

exports.getAll = async (req, res) => {
  try {
    const factures = await Facture.findAll({
      include: [
        {
          model: Reparation,
          include: [
            {
              model: DemandeReparation,
              include: [
                {
                  model: Appareil,
                  include: [Client]
                }
              ]
            },
            {
              model: LigneReparation,
              include: [Piece]
            }
          ]
        }
      ]
    });

    res.json(factures);

  } catch (error) {
    res.status(500).json({
      message: error.message
    });
  }
};
exports.getOne = async (req, res) => {
  try {
    const data = await Facture.findByPk(req.params.id, {
      include: Reparation
    });

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
exports.update = async (req, res) => {
  try {
    const data = await Facture.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.update(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.delete = async (req, res) => {
  try {
    const data = await Facture.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// Factures liées aux réparations du client (pour le portail client)
exports.getByClientId = async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId, 10);
    if (isNaN(clientId)) return res.status(400).json({ message: "clientId invalide" });

    // Isolation : un client ne voit que SES factures
    if (req.user.role === "client" && req.user.clientId !== clientId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const factures = await Facture.findAll({
      include: [{
        model: Reparation,
        required: true,
        include: [{
          model: DemandeReparation,
          required: true,
          include: [{
            model: Appareil,
            required: true,
            where: { ClientId: clientId },
            include: [Client]
          }]
        }, {
          model: LigneReparation,
          include: [Piece]
        }]
      }],
      order: [["createdAt", "DESC"]]
    });

    res.json(factures);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};