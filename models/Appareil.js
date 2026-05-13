const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Appareil = sequelize.define("Appareil", {
  marque: DataTypes.STRING,
  modele: DataTypes.STRING,
  numSerie: DataTypes.STRING,
  type: DataTypes.STRING,
}, {
  tableName: "appareils"
});

module.exports = Appareil;