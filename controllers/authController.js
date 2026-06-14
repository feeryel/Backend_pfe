const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { User, Client } = require("../models");

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

  if (!user) return res.status(401).json({ message: "Identifiants incorrects" });

  const match = await bcrypt.compare(motDePasse, user.motDePasse);
  if (!match) return res.status(401).json({ message: "Identifiants incorrects" });

  if (user.bannit) return res.status(403).json({ message: "Compte banni" });
  if (!user.actif)  return res.status(403).json({ message: "Compte désactivé" });

  const tokenPayload = { id: user.id, role: user.role, login: user.login };
  const response = {
    token:  null,
    role:   user.role,
    userId: user.id,
    login:  user.login
  };

  if (user.role === "client") {
    const clientProfile = await Client.findOne({ where: { userId: user.id } });
 if (clientProfile) {
      tokenPayload.clientId = clientProfile.id;
      response.clientId = clientProfile.id;
      response.clientName = clientProfile.nom;
    }
  }

  response.token = jwt.sign(tokenPayload, process.env.JWT_SECRET || "secretkey");

  res.json(response);
};
