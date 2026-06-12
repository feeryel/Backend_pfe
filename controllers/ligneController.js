const { LigneReparation, Piece, Reparation } = require("../models");

exports.create = async (req, res) => {
  try {
    const quantite = Number(req.body.quantite);
    const { ReparationId, PieceId, prixHT } = req.body;

    const piece = await Piece.findByPk(PieceId);
    if (!piece) {
      return res.status(404).json({ message: "Pièce introuvable" });
    }

    if ((piece.quantiteEnStock ?? 0) < quantite) {
      return res.status(400).json({ message: "Stock insuffisant pour cette pièce" });
    }

    const data = await LigneReparation.create({
      quantite,
      prixHT,
      ReparationId,
      PieceId
    });

    piece.quantiteEnStock -= quantite;
    await piece.save();

    res.json(data);
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};

exports.getAll = async (req, res) => {
  try {
    const data = await LigneReparation.findAll({
      include: [Piece, Reparation]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Nouvelle méthode — filtre par ReparationId
exports.getByReparation = async (req, res) => {
  try {
    const data = await LigneReparation.findAll({
      where: { ReparationId: req.params.reparationId },
      include: [Piece]
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getOne = async (req, res) => {
  try {
    const data = await LigneReparation.findByPk(req.params.id, {
      include: [Piece, Reparation]
    });

    if (!data) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.update = async (req, res) => {
  try {
    const data = await LigneReparation.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    const newQuantite = req.body.quantite != null ? Number(req.body.quantite) : data.quantite;
    const newPieceId = req.body.PieceId ?? data.PieceId;

    // Si la pièce ou la quantité change, on ré-ajuste le stock
    if (newQuantite !== data.quantite || newPieceId !== data.PieceId) {

      // On restitue le stock de l'ancienne pièce
      const oldPiece = await Piece.findByPk(data.PieceId);
      if (oldPiece) {
        oldPiece.quantiteEnStock += data.quantite;
        await oldPiece.save();
      }

      // On vérifie et décrémente le stock de la nouvelle pièce
      const newPiece = await Piece.findByPk(newPieceId);
      if (!newPiece) {
        // on annule la restitution si la nouvelle pièce n'existe pas
        if (oldPiece) {
          oldPiece.quantiteEnStock -= data.quantite;
          await oldPiece.save();
        }
        return res.status(404).json({ message: "Pièce introuvable" });
      }

      if ((newPiece.quantiteEnStock ?? 0) < newQuantite) {
        if (oldPiece) {
          oldPiece.quantiteEnStock -= data.quantite;
          await oldPiece.save();
        }
        return res.status(400).json({ message: "Stock insuffisant pour cette pièce" });
      }

      newPiece.quantiteEnStock -= newQuantite;
      await newPiece.save();
    }

    await data.update(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.delete = async (req, res) => {
  try {
    const data = await LigneReparation.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    // On restitue la quantité au stock de la pièce
    const piece = await Piece.findByPk(data.PieceId);
    if (piece) {
      piece.quantiteEnStock += data.quantite;
      await piece.save();
    }

    await data.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};
