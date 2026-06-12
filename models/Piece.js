const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Piece = sequelize.define("Piece", {
  code: DataTypes.STRING,
  nom: DataTypes.STRING,
  prixAchat: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  prixHT: DataTypes.FLOAT,
  quantiteEnStock: DataTypes.INTEGER,
});

module.exports = Piece;