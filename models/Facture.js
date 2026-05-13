const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Facture = sequelize.define("Facture", {
  numero: DataTypes.STRING,
  date: DataTypes.DATE,

  montantHT: DataTypes.FLOAT,
  montantTVA: DataTypes.FLOAT,
  timbreFiscale: DataTypes.FLOAT,
  montantTotal: DataTypes.FLOAT,
    ReparationId: DataTypes.INTEGER   // 🔥 optional but recommended

});

module.exports = Facture;