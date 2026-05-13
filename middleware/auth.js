const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const header = req.headers.authorization;

  if (!header) {
    return res.status(401).json({ message: "Token manquant" });
  }

  const token = header.split(" ")[1]; // Bearer TOKEN

  try {
    const decoded = jwt.verify(token, "secretkey");
    req.user = decoded; // نخزن user في request
    next();
  } catch (err) {
    return res.status(401).json({ message: "Token invalide" });
  }
};