const { Appareil, Client } = require("../models");

exports.create = async (req, res) => {
  try {
    const { marque, modele, numSerie, type, clientId } = req.body;

    const appareil = await Appareil.create({
      marque,
      modele,
      numSerie,
      type,
      ClientId: clientId
    });

    res.status(201).json(appareil);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAll = async (req, res) => {
  const data = await Appareil.findAll({
    include: Client
  });
  res.json(data);
};

exports.getOne = async (req, res) => {
  const data = await Appareil.findByPk(req.params.id, {
    include: Client
  });
  res.json(data);
};
exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const appareil = await Appareil.findByPk(id);

    if (!appareil) {
      return res.status(404).json({ message: "Appareil not found" });
    }

    await appareil.destroy();

    res.json({ message: "Deleted successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;

    const { marque, modele, numSerie, type, clientId } = req.body;

    const appareil = await Appareil.findByPk(id);

    if (!appareil) {
      return res.status(404).json({ message: "Appareil not found" });
    }

    await appareil.update({
      marque,
      modele,
      numSerie,
      type,
      ClientId: clientId
    });

    res.json(appareil);
  } catch (err) {
    res.status(500).json(err);
  }
};


exports.getByClient = async (req, res) => {
  const data = await Appareil.findAll({
    where: { ClientId: req.params.clientId }
  });

  res.json(data);
};