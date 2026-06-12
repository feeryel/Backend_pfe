// models/DemandeReparation.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const DemandeReparation = sequelize.define("DemandeReparation", {
  dateDepot: {
    type: DataTypes.DATE,
    allowNull: false
  },
  datePrevueRep: DataTypes.DATE,
  symptomesPanne: DataTypes.TEXT,
  etat: {
    type: DataTypes.ENUM("En attente", "En cours", "Terminée"),
    allowNull: false,
    defaultValue: "En attente"
  }
}, {
  tableName: "demandes_reparation" // force tableName
});

module.exports = DemandeReparation;