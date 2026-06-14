const crypto = require("crypto");
const { Devis, Reparation, Demande, Appareil, Client, LigneReparation, Piece } = require("../models");
const { addMailJob } = require("../services/mailQueue");
const { sendWhatsAppMessage } = require("../services/whatsappService");
const notificationService = require("../services/notificationService");
const auditService = require("../services/auditService");

const TVA_RATE = 0.19;
const TIMBRE_FISCAL = 1;
const TARIF_HORAIRE_MAIN_OEUVRE = 30; // TND / heure
const FRONTEND_URL = process.env.APP_URL || "https://regal-cobbler-e2516a.netlify.app";

const REPARATION_INCLUDE = [
  { model: LigneReparation, include: [Piece] },
  { model: Demande, include: [{ model: Appareil, include: [Client] }] },
  Devis
];

exports.create = async (req, res) => {
  try {
    const reparation = await Reparation.findByPk(req.params.reparationId, {
      include: REPARATION_INCLUDE
    });

    if (!reparation) {
      return res.status(404).json({ message: "Réparation non trouvée" });
    }

    if (reparation.Devis) {
      return res.status(409).json({ message: "Un devis existe déjà pour cette réparation" });
    }

    const montantPieces = (reparation.LigneReparations || []).reduce(
      (sum, l) => sum + (l.quantite * l.prixHT), 0
    );
    const montantMainOeuvre = (reparation.tempsMainOeuvre || 0) * TARIF_HORAIRE_MAIN_OEUVRE;
    const montantHT = montantPieces + montantMainOeuvre;

    if (montantHT <= 0) {
      return res.status(400).json({
        message: "Impossible de générer un devis : aucune pièce ni temps de main d'œuvre n'est enregistré pour cette réparation."
      });
    }

    const montantTVA = montantHT * TVA_RATE;
    const montantTotal = montantHT + montantTVA + TIMBRE_FISCAL;

    const token = crypto.randomBytes(24).toString("hex");

    const devis = await Devis.create({
      montantHT,
      montantPieces,
      montantMainOeuvre,
      montantTVA,
      timbreFiscale: TIMBRE_FISCAL,
      montantTotal,
      statut: "EN_ATTENTE",
      token,
      dateEnvoi: new Date(),
      ReparationId: reparation.id,
      creeParId: req.user.id
    });

    devis.numero = `DV-${new Date().getFullYear()}-${String(devis.id).padStart(4, "0")}`;
    await devis.save();

    reparation.status = "EN_ATTENTE_DEVIS";
    await reparation.save();

    const client = reparation.DemandeReparation?.Appareil?.Client;
    const lienPublic = `${FRONTEND_URL}/public/devis/${token}`;

    if (client?.email) {
      addMailJob({
        type: "devis",
        to: client.email,
        nom: client.nom,
        numero: devis.numero,
        montantTotal: devis.montantTotal,
        lien: lienPublic
      });
    }

    if (client?.numTel) {
      const cleanNumber = client.numTel.replace(/\D/g, "");
      const jid = cleanNumber + "@s.whatsapp.net";

      const msg =
        `TechDoctor\n\n` +
        `Un devis de réparation est disponible pour votre appareil.\n\n` +
        `Référence : ${devis.numero}\n` +
        `Montant total : ${devis.montantTotal.toFixed(2)} TND\n\n` +
        `Consultez et répondez ici :\n${lienPublic}\n\n` +
        `— TechDoctor`;

      sendWhatsAppMessage(jid, msg)
        .then(() => console.log("[WA DEVIS SENT ✔]"))
        .catch(err => console.error("[WA DEVIS ERROR]", err));
    }

    if (client?.userId) {
      notificationService.notify({
        userId: client.userId,
        type: "DEVIS_CREATED",
        title: "Nouveau devis disponible",
        message: `Un devis (${devis.numero}) est en attente de votre validation.`,
        link: "/reparations"
      });
    }

    auditService.logAction({
      userId: req.user.id,
      userLogin: req.user.login,
      action: "CREATE",
      entity: "Devis",
      entityId: devis.id,
      details: { numero: devis.numero, montantTotal: devis.montantTotal, ReparationId: reparation.id }
    });

    res.status(201).json(devis);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getByReparation = async (req, res) => {
  try {
    const devis = await Devis.findOne({ where: { ReparationId: req.params.reparationId } });
    if (!devis) return res.status(404).json({ message: "Aucun devis pour cette réparation" });
    res.json(devis);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.getPublicByToken = async (req, res) => {
  try {
    const devis = await Devis.findOne({
      where: { token: req.params.token },
      include: [
        {
          model: Reparation,
          include: [
            { model: LigneReparation, include: [Piece] },
            { model: Demande, include: [{ model: Appareil, include: [Client] }] }
          ]
        }
      ]
    });

    if (!devis) return res.status(404).json({ message: "Devis introuvable" });

    res.json(devis);
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};

exports.respondPublic = async (req, res) => {
  try {
    const devis = await Devis.findOne({ where: { token: req.params.token } });
    if (!devis) return res.status(404).json({ message: "Devis introuvable" });

    if (devis.statut !== "EN_ATTENTE") {
      return res.status(409).json({ message: "Ce devis a déjà reçu une réponse." });
    }

    const { action, motif } = req.body;
    if (!["accept", "reject"].includes(action)) {
      return res.status(400).json({ message: "Action invalide" });
    }

    const reparation = await Reparation.findByPk(devis.ReparationId);

    if (action === "accept") {
      devis.statut = "ACCEPTE";
      if (reparation) {
        reparation.status = "IN_PROGRESS";
        await reparation.save();
      }
    } else {
      devis.statut = "REFUSE";
      devis.motifRefus = motif || null;
      if (reparation) {
        reparation.status = "REFUSEE_CLIENT";
        await reparation.save();
      }
    }

    devis.dateReponse = new Date();
    await devis.save();

    if (devis.creeParId) {
      notificationService.notify({
        userId: devis.creeParId,
        type: action === "accept" ? "DEVIS_ACCEPTED" : "DEVIS_REFUSED",
        title: action === "accept" ? "Devis accepté" : "Devis refusé",
        message: `Le client a ${action === "accept" ? "accepté" : "refusé"} le devis ${devis.numero}.`,
        link: "/reparations"
      });
    }

    auditService.logAction({
      userId: null,
      userLogin: "client (lien public)",
      action: "STATUS_CHANGE",
      entity: "Devis",
      entityId: devis.id,
      details: { statut: devis.statut, motifRefus: devis.motifRefus }
    });

    res.json({ message: "Réponse enregistrée", statut: devis.statut });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
