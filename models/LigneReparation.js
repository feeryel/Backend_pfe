// models/LigneReparation.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const LigneReparation = sequelize.define("LigneReparation", {
  quantite: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
  },
  prixHT: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  }
}, {
  tableName: "ligne_reparation" // force tableName
});

module.exports = LigneReparation;