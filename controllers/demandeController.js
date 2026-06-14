const { Demande, Appareil, Planning } = require("../models");
const axios = require("axios");
const auditService = require("../services/auditService");
// CREATE
exports.create = async (req, res) => {
  try {
    const {
      dateDepot,
      datePrevueRep,
      symptomesPanne,
      etat,
      appareilId
    } = req.body;

    if (datePrevueRep && new Date(datePrevueRep) < new Date(dateDepot || Date.now())) {
      return res.status(400).json({ message: "La date prévue ne peut pas être avant la date de dépôt" });
    }

    const data = await Demande.create({
      dateDepot: dateDepot || new Date(),
      datePrevueRep,
      symptomesPanne,
      etat: etat || "En attente",
      AppareilId: appareilId
    });

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "CREATE",
      entity: "Demande",
      entityId: data.id,
      details: { symptomesPanne: data.symptomesPanne, etat: data.etat }
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

exports.predictDate = async (req, res) => {
  try {
    const { symptomesPanne } = req.body;

    const response = await axios.post(
      process.env.N8N_WEBHOOK_URL,
      { symptomesPanne }
    );

    return res.json(response.data);

  } catch (err) {
    console.log("N8N ERROR:", err?.response?.data || err.message);

    return res.status(500).json({
      message: "Prediction error",
      error: err?.response?.data || err.message
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
      appareilId
    } = req.body;

    if (datePrevueRep && new Date(datePrevueRep) < new Date(dateDepot || data.dateDepot)) {
      return res.status(400).json({ message: "La date prévue ne peut pas être avant la date de dépôt" });
    }

    await data.update({
      dateDepot,
      datePrevueRep,
      symptomesPanne,
      etat,
      AppareilId: appareilId
    });

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "UPDATE",
      entity: "Demande",
      entityId: data.id,
      details: { symptomesPanne: data.symptomesPanne, etat: data.etat }
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

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "DELETE",
      entity: "Demande",
      entityId: req.params.id
    });

    res.json({ message: "Supprimée avec succès" });
  } catch (err) {
    console.error("DELETE DEMANDE ERROR:", err);
    res.status(500).json({ message: "Erreur serveur" });
  }
};