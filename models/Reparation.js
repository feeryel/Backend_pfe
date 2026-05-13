const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Reparation = sequelize.define("Reparation", {
  dateFinRep: DataTypes.DATE,
  descriptionReparation: DataTypes.TEXT,
  tempsMainOeuvre: DataTypes.FLOAT,
  estReparable: DataTypes.BOOLEAN,
 status: {
    type: DataTypes.STRING,
    defaultValue: "IN_PROGRESS"
  }
});
module.exports = Reparation;