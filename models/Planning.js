const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Planning = sequelize.define("Planning", {
  dateDebut: DataTypes.DATE,
  dateFin: DataTypes.DATE,
});

module.exports = Planning;