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
      "technicien",
      "reception",
      "responsable_reparation",
      "achat_stock"
    ),
    allowNull: false
  }
}, {
  tableName: "utilisateurs",
  timestamps: true
});

module.exports = User;