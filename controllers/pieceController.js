const { Piece } = require("../models");

function validatePiece(body) {
  const { prixAchat, prixHT, quantiteEnStock } = body;

  if (prixAchat != null && prixAchat < 0) {
    return "Le prix d'achat ne peut pas être négatif";
  }
  if (prixHT != null && prixHT < 0) {
    return "Le prix de vente ne peut pas être négatif";
  }
  if (quantiteEnStock != null && quantiteEnStock < 0) {
    return "La quantité en stock ne peut pas être négative";
  }
  return null;
}

exports.create = async (req, res) => {
  try {
    const error = validatePiece(req.body);
    if (error) return res.status(400).json({ message: error });

    const { code, nom, prixAchat, prixHT, quantiteEnStock } = req.body;
    const data = await Piece.create({ code, nom, prixAchat, prixHT, quantiteEnStock });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await Piece.findAll();
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await Piece.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Pièce introuvable" });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const error = validatePiece(req.body);
    if (error) return res.status(400).json({ message: error });

    const { code, nom, prixAchat, prixHT, quantiteEnStock } = req.body;
    const [updated] = await Piece.update(
      { code, nom, prixAchat, prixHT, quantiteEnStock },
      { where: { id: req.params.id } }
    );

    if (!updated) return res.status(404).json({ message: "Pièce introuvable" });
    res.json({ message: "Piece updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.delete = async (req, res) => {
  try {
    const deleted = await Piece.destroy({ where: { id: req.params.id } });
    if (!deleted) return res.status(404).json({ message: "Pièce introuvable" });
    res.json({ message: "Piece deleted" });
  } catch (err) {
    if (err.name === "SequelizeForeignKeyConstraintError") {
      return res.status(409).json({ message: "Cette pièce est utilisée dans des réparations et ne peut pas être supprimée" });
    }
    res.status(500).json({ message: err.message });
  }
};
