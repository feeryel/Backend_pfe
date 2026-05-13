const { Piece } = require("../models");

exports.create = async (req, res) => {
  const data = await Piece.create(req.body);
  res.json(data);
};

exports.getAll = async (req, res) => {
  const data = await Piece.findAll();
  res.json(data);
};

exports.getOne = async (req, res) => {
  const data = await Piece.findByPk(req.params.id);
  res.json(data);
};

exports.update = async (req, res) => {
  await Piece.update(req.body, { where: { id: req.params.id } });
  res.json({ message: "Piece updated" });
};

exports.delete = async (req, res) => {
  await Piece.destroy({ where: { id: req.params.id } });
  res.json({ message: "Piece deleted" });
};