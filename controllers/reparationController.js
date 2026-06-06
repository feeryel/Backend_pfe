const { Reparation, Demande, LigneReparation, Piece, Facture, User, Appareil, Client } = require("../models");
const { notifyReparationDone } = require("../services/webhookService");
const { addMailJob } = require("../services/mailQueue");

exports.create = async (req, res) => {
  try {
    const data = await Reparation.create({
      ...req.body,
      DemandeId: req.body.demandeId,
      technicienId: req.body.technicienId
    });

    res.status(201).json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getPrice = async (req, res) => {
  const rep = await Reparation.findByPk(req.params.id, {
    include: Facture
  });

  res.json({
    reparationId: rep.id,
    prix: rep.Facture?.montantTotal || null,
    status: rep.Facture ? "FACTURED" : "NOT_READY"
  });
};

exports.getStatus = async (req, res) => {
  try {
    const rep = await Reparation.findByPk(req.params.id, {
  attributes: ["id", "status", "estReparable", "dateFinRep"]
});

    if (!rep) {
      return res.status(404).json({ message: "Reparation not found" });
    }

    res.json({
      id: rep.id,
      status: rep.status,
      estReparable: rep.estReparable,
      dateFinRep: rep.dateFinRep
    });

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
exports.getOne = async (req, res) => {
  try {
    const data = await Reparation.findByPk(req.params.id, {
      include: [
        {
          model: Demande,
          include: [
            {
              model: Appareil,
              include: [Client]  // 🔥 IMPORTANT
            }
          ]
        },
        { model: User, as: "technicien" },
        {
          model: LigneReparation,
          include: [Piece]
        },
        Facture
      ]
    });

    if (!data) {
      return res.status(404).json({ message: "Reparation not found" });
    }

    res.json(data);

  } catch (err) {
    res.status(500).json({
      message: "Server error",
      error: err.message
    });
  }
};
const INCLUDE_FULL = [
  {
    model: Demande,
    include: [{ model: Appareil, include: [Client] }]
  },
  { model: User, as: "technicien" },
  { model: LigneReparation, include: [Piece] },
  Facture
];

exports.getAll = async (req, res) => {
  try {
    // Le technicien ne voit que ses réparations assignées
    const where = req.user.role === "technicien"
      ? { technicienId: req.user.id }
      : {};

    const data = await Reparation.findAll({ where, include: INCLUDE_FULL });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

// Alias explicite pour le technicien (même résultat que getAll avec role=technicien)
exports.getAssigned = async (req, res) => {
  try {
    const data = await Reparation.findAll({
      where: { technicienId: req.user.id },
      include: INCLUDE_FULL
    });
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
exports.update = async (req, res) => {
  try {
    const data = await Reparation.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.update(req.body);
    res.json(data);
  } catch (err) {
    res.status(500).json(err);
  }
};
exports.updateStatus = async (req, res) => {
  try {
    const rep = await Reparation.findByPk(req.params.id);

    if (!rep) {
      return res.status(404).json({ message: "Reparation not found" });
    }

    const previousStatus = rep.status;
    rep.status = req.body.status;
    await rep.save();

    res.json({ message: "Status updated", status: rep.status });

if (rep.status === "DONE" && previousStatus !== "DONE") {
  console.log("[STATUS] DONE → webhook start");

  try {
    const full = await Reparation.findByPk(rep.id, {
      include: [
        {
          model: Demande,
          include: [
            {
              model: Appareil,
              include: [
                {
                  model: Client,
                  include: [{ model: User, as: "user" }]
                }
              ]
            }
          ]
        }
      ]
    });

    console.log("FULL RAW =", JSON.stringify(full, null, 2));

    // 🔥 IMPORTANT FIX ICI
    const demande = full?.DemandeReparation;
    const appareil = demande?.Appareil;
    const client = appareil?.Client;
    const user = client?.user;

    console.log("[DEBUG DEMANDE]", demande);
    console.log("[DEBUG APPAREIL]", appareil);
    console.log("[DEBUG CLIENT]", client);
    console.log("[DEBUG USER]", user);

    if (!client) {
      console.warn("[WEBHOOK] Client not found");
      return;
    }

    const email = client.email || user?.login;

    if (!email) {
      console.warn("[WEBHOOK] Email missing");
      return;
    }

    const payload = {
      reparationId: rep.id,
      clientId: client.id,
      clientNom: client.nom,
      clientEmail: email,
      clientTel: client.numTel,
      appareil: `${appareil?.marque ?? ""} ${appareil?.modele ?? ""}`.trim(),
      dateFinRep: rep.dateFinRep ?? new Date().toISOString()
    };

    console.log("[WEBHOOK PAYLOAD]", payload);

    notifyReparationDone(payload)
      .then(() => console.log("[WEBHOOK SENT ✔]"))
      .catch(err => console.error("[WEBHOOK ERROR]", err));

    if (email) {
      addMailJob({
        type: "reparation_done",
        to: email,
        nom: client.nom,
        appareil: payload.appareil,
        reparationId: rep.id
      });
    }

  } catch (err) {
    console.error("[WEBHOOK ERROR]", err);
  }
}
  } catch (err) {
    console.error(err);
    res.status(500).json(err);
  }
};
exports.delete = async (req, res) => {
  try {
    const data = await Reparation.findByPk(req.params.id);
    if (!data) return res.status(404).json({ message: "Not found" });

    await data.destroy();
    res.json({ message: "Deleted" });
  } catch (err) {
    res.status(500).json(err);
  }
};

// Réparations d'un client spécifique (pour le dashboard client)
exports.getByClientId = async (req, res) => {
  try {
    const clientId = parseInt(req.params.clientId, 10);
    if (isNaN(clientId)) return res.status(400).json({ message: "clientId invalide" });

    // Un client ne peut consulter QUE ses propres réparations
    if (req.user.role === "client" && req.user.clientId !== clientId) {
      return res.status(403).json({ message: "Accès refusé" });
    }

    const data = await Reparation.findAll({
      include: [
        {
          model: Demande,
          required: true,
          include: [
            {
              model: Appareil,
              required: true,
              where: { ClientId: clientId },
              include: [Client]
            }
          ]
        },
        { model: User, as: "technicien" },
        { model: LigneReparation, include: [Piece] },
        Facture
      ]
    });

    res.json(data);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};