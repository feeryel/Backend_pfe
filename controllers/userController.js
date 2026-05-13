const { User } = require("../models");

const bcrypt = require("bcrypt");

// 🔹 CREATE USER
exports.create = async (req, res) => {
  try {
    const { login, motDePasse, role } = req.body;

    // 🔐 hash password
    const hashedPassword = await bcrypt.hash(motDePasse, 10);

    const user = await User.create({
      login,
      motDePasse: hashedPassword,
      role
    });

    res.status(201).json(user);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAll = async (req, res) => {
  const data = await User.findAll();
  res.json(data);
};

exports.getOne = async (req, res) => {
  const data = await User.findByPk(req.params.id);
  res.json(data);
};

exports.update = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });

  await user.update(req.body);
  res.json(user);
};

exports.delete = async (req, res) => {
  const user = await User.findByPk(req.params.id);
  if (!user) return res.status(404).json({ message: "Not found" });

  await user.destroy();
  res.json({ message: "Deleted" });
};