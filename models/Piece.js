const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Piece = sequelize.define("Piece", {
  code: DataTypes.STRING,
  nom: DataTypes.STRING,
  prixHT: DataTypes.FLOAT,
  quantiteEnStock: DataTypes.INTEGER,
});

module.exports = Piece;