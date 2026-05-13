const { Demande, Appareil, Planning } = require("../models");

// CREATE
exports.create = async (req, res) => {
  try {
    const {
      dateDepot,
      datePrevueRep,
      symptomesPanne,
      etat,
      idEtiquette,
      appareilId
    } = req.body;

    const data = await Demande.create({
      dateDepot: dateDepot || new Date(),
      datePrevueRep,
      symptomesPanne,
      etat: etat || "En attente",
      idEtiquette,
      AppareilId: appareilId
    });

    res.status(201).json(data);
  } catch (err) {
    console.error("CREATE DEMANDE ERROR:", err);
    res.status(500).json({
      message: "Erreur serveur",
      error: err.message
    });
  }
};

// GET ALL
exports.getAll = async (req, res) => {
  try {
    const data = await Demande.findAll({
      include: [Appareil, Planning]
    });

    res.json(data);
  } catch (err) {
    console.error("GET ALL DEMANDE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};
exports.getByClient = async (req, res) => {
  const data = await Demande.findAll({
    include: {
      model: Appareil,
      where: { ClientId: req.params.clientId }
    }
  });

  res.json(data);
};
// GET ONE
exports.getOne = async (req, res) => {
  try {
    const data = await Demande.findByPk(req.params.id, {
      include: [Appareil, Planning]
    });

    if (!data) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    res.json(data);
  } catch (err) {
    console.error("GET ONE DEMANDE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// UPDATE
exports.update = async (req, res) => {
  try {
    const data = await Demande.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    const {
      dateDepot,
      datePrevueRep,
      symptomesPanne,
      etat,
      idEtiquette,
      appareilId
    } = req.body;

    await data.update({
      dateDepot,
      datePrevueRep,
      symptomesPanne,
      etat,
      idEtiquette,
      AppareilId: appareilId
    });

    res.json(data);
  } catch (err) {
    console.error("UPDATE DEMANDE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};

// DELETE
exports.delete = async (req, res) => {
  try {
    const data = await Demande.findByPk(req.params.id);

    if (!data) {
      return res.status(404).json({ message: "Demande non trouvée" });
    }

    await data.destroy();

    res.json({ message: "Supprimée avec succès" });
  } catch (err) {
    console.error("DELETE DEMANDE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};