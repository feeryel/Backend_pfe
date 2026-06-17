const { User, Client, Reparation, Facture, Demande, Devis } = require("../models");
const { Op, fn, col, literal } = require("sequelize");
const sequelize = require("../config/database");

exports.getStats = async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();

    // ── Users (non-admin) ──────────────────────────────────────────
    const allUsers = await User.findAll({
      attributes: ["role", "actif", "bannit"],
      where: { role: { [Op.ne]: "admin" } }
    });

    const totalUsers  = allUsers.length;
    const activeUsers = allUsers.filter(u => u.actif && !u.bannit).length;

    const roleCount = {};
    allUsers.forEach(u => {
      roleCount[u.role] = (roleCount[u.role] ?? 0) + 1;
    });

    // ── Clients ───────────────────────────────────────────────────
    const totalClients = await Client.count();

    // ── Reparations ───────────────────────────────────────────────
    const allReps = await Reparation.findAll({
      attributes: ["id", "status", "dateFinRep", "technicienId"]
    });

    const totalReparations = allReps.length;
    let done = 0, inProgress = 0, pending = 0, failed = 0, enAttenteDevis = 0, refuseeClient = 0;
    const monthly = new Array(12).fill(0);
    const techCount = {};

    allReps.forEach(r => {
      switch ((r.status ?? "").toUpperCase()) {
        case "DONE":             done++;            break;
        case "IN_PROGRESS":      inProgress++;       break;
        case "PENDING":          pending++;          break;
        case "FAILED":           failed++;           break;
        case "EN_ATTENTE_DEVIS": enAttenteDevis++;    break;
        case "REFUSEE_CLIENT":   refuseeClient++;     break;
      }

      if (r.dateFinRep) {
        const d = new Date(r.dateFinRep);
        if (d.getFullYear() === currentYear && !isNaN(d.getMonth())) {
          monthly[d.getMonth()]++;
        }
      }

      if (r.technicienId) {
        techCount[r.technicienId] = (techCount[r.technicienId] ?? 0) + 1;
      }
    });

    // Resolve technician names
    const techIds = Object.keys(techCount).map(Number);
    let topTechs = [];
    if (techIds.length) {
      const techUsers = await User.findAll({
        where: { id: { [Op.in]: techIds } },
        attributes: ["id", "login"]
      });
      topTechs = techUsers
        .map(u => ({ label: u.login, value: techCount[u.id] ?? 0 }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 6);
    }

    // ── Factures — uniquement les réparations DONE ────────────────
    const factures = await Facture.findAll({
      attributes: ["montantTotal", "date"],
      include: [{
        model: Reparation,
        attributes: [],
        where: { status: "DONE" },
        required: true
      }]
    });
    const totalRevenue = factures.reduce((sum, f) => sum + (parseFloat(f.montantTotal) || 0), 0);
    const totalFactures = factures.length;

    const revenueMonthly = new Array(12).fill(0);
    factures.forEach(f => {
      if (f.date) {
        const d = new Date(f.date);
        if (d.getFullYear() === currentYear && !isNaN(d.getMonth())) {
          revenueMonthly[d.getMonth()] += parseFloat(f.montantTotal) || 0;
        }
      }
    });

    // ── Devis ────────────────────────────────────────────────────
    const allDevis = await Devis.findAll({ attributes: ["statut"] });
    const devisTotal    = allDevis.length;
    const devisEnAttente = allDevis.filter(d => d.statut === "EN_ATTENTE").length;
    const devisAccepte   = allDevis.filter(d => d.statut === "ACCEPTE").length;
    const devisRefuse    = allDevis.filter(d => d.statut === "REFUSE").length;
    const devisRepondu   = devisAccepte + devisRefuse;
    const tauxAcceptation = devisRepondu ? Math.round((devisAccepte / devisRepondu) * 100) : 0;

    res.json({
      users: {
        total: totalUsers,
        active: activeUsers,
        byRole: roleCount
      },
      clients: {
        total: totalClients
      },
      reparations: {
        total: totalReparations,
        done,
        inProgress,
        pending,
        failed,
        enAttenteDevis,
        refuseeClient,
        monthly,
        completionRate: totalReparations ? Math.round((done / totalReparations) * 100) : 0
      },
      topTechs,
      devis: {
        total: devisTotal,
        enAttente: devisEnAttente,
        accepte: devisAccepte,
        refuse: devisRefuse,
        tauxAcceptation
      },
      revenue: {
        total: Math.round(totalRevenue * 100) / 100,
        totalFactures,
        monthly: revenueMonthly.map(v => Math.round(v * 100) / 100)
      }
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur serveur", error: err.message });
  }
};
