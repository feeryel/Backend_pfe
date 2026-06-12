const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Planning = sequelize.define("Planning", {
  description: {
    type: DataTypes.STRING,
    allowNull: true
  },
  dateDebut: DataTypes.DATE,
  dateFin: DataTypes.DATE,
  statut: {
    type: DataTypes.ENUM("PLANIFIE", "EN_COURS", "TERMINE"),
    allowNull: false,
    defaultValue: "PLANIFIE"
  },
  technicienId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
});

module.exports = Planning;
