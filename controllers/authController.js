const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  const { login, motDePasse, role } = req.body;

  const hashed = await bcrypt.hash(motDePasse, 10);

  const user = await User.create({
    login,
    motDePasse: hashed,
    role
  });

  res.json(user);
};

exports.login = async (req, res) => {
  const { login, motDePasse } = req.body;

  const user = await User.findOne({ where: { login } });

  if (!user) return res.status(404).json({ message: "User not found" });

  const match = await bcrypt.compare(motDePasse, user.motDePasse);

  if (!match) return res.status(401).json({ message: "Wrong password" });

  const token = jwt.sign({ id: user.id, role: user.role }, "secretkey");

res.json({
  token,
  role: user.role
});
};