const express = require("express");
const router  = express.Router();
const { Facture } = require("../models");

router.get("/:factureId", async (req, res) => {
  try {
    const facture = await Facture.findByPk(req.params.factureId, {
      include: [
        {
          model: require("../models").Reparation,
          include: [
            {
              model: require("../models").Demande,
              include: [
                {
                  model: require("../models").Appareil,
                  include: [{ model: require("../models").Client }]
                }
              ]
            },
            {
              model: require("../models").LigneReparation,
              include: [{ model: require("../models").Piece }]
            }
          ]
        }
      ]
    });

    if (!facture) return res.status(404).json({ error: "Facture not found" });
    res.json(facture);
  } catch (err) {
    console.error("Erreur garantie:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;



