const { Facture, Reparation } = require("../models");

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
  const data = await Facture.findAll({
    include: Reparation
  });

  res.json(data);
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