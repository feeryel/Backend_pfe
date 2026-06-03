const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const User = sequelize.define("User", {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },

  login: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },

  motDePasse: {
    type: DataTypes.STRING,
    allowNull: false
  },

  role: {
    type: DataTypes.ENUM(
      "admin",
      "client",
      "technicien",
      "reception",
      "responsable_reparation",
      "achat_stock"
    ),
    allowNull: false
  },
  actif: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true
  },
  bannit: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: "utilisateurs",
  timestamps: true
});

module.exports = User;