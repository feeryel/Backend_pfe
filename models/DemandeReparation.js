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
    type: DataTypes.STRING,
    defaultValue: "En attente"
  },
  idEtiquette: DataTypes.INTEGER
}, {
  tableName: "demandes_reparation" // force tableName
});

module.exports = DemandeReparation;