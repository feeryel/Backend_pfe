const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Client = sequelize.define("Client", {
  nom: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  adresse: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  numTel: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  email: {
  type: DataTypes.STRING,
  allowNull: false
}
}, {
  tableName: "clients",
  timestamps: true
});

module.exports = Client;