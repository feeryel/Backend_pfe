const Client = require("./Client");
const Appareil = require("./Appareil");
const Demande = require("./DemandeReparation");
const Reparation = require("./Reparation");
const Piece = require("./Piece");
const Facture = require("./Facture");
const Planning = require("./Planning");
const User = require("./User");
const LigneReparation = require("./LigneReparation");

/* ================= RELATIONS ================= */

// Client → Appareil
Client.hasMany(Appareil);
Appareil.belongsTo(Client);

// Appareil → Demande
Appareil.hasMany(Demande);
Demande.belongsTo(Appareil);

// Demande → Reparation
Demande.hasOne(Reparation, {
  foreignKey: "demandeId"
});

Reparation.belongsTo(Demande, {
  foreignKey: "demandeId"
});

// Reparation → Ligne
Reparation.hasMany(LigneReparation, {
  foreignKey: "ReparationId"
});

LigneReparation.belongsTo(Reparation, {
  foreignKey: "ReparationId"
});

Piece.hasMany(LigneReparation, {
  foreignKey: "PieceId"
});

LigneReparation.belongsTo(Piece, {
  foreignKey: "PieceId"
});

// Reparation → Facture
Reparation.hasOne(Facture);
Facture.belongsTo(Reparation, {
  foreignKey: "ReparationId"
});
// ================= USERS =================

// Technicien yaamel réparation
User.hasMany(Reparation, { foreignKey: "technicienId" });
Reparation.belongsTo(User, { as: "technicien", foreignKey: "technicienId" });

// Responsable réparation yaamel planning
User.hasMany(Planning, { foreignKey: "responsableId" });
Planning.belongsTo(User, { as: "responsable", foreignKey: "responsableId" });

// Demande → Planning (optionnel)
Demande.hasOne(Planning, {
  foreignKey: "DemandeReparationId"
});

Planning.belongsTo(Demande, {
  foreignKey: "DemandeReparationId"
});

module.exports = {
  Client,
  Appareil,
  Demande,
  Reparation,
  Piece,
  LigneReparation,
  Facture,
  Planning,
  User
};