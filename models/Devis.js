const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Devis = sequelize.define("Devis", {
  numero: {
    type: DataTypes.STRING,
    allowNull: true
  },
  montantHT: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  montantPieces: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  montantMainOeuvre: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  montantTVA: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  timbreFiscale: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1
  },
  montantTotal: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0
  },
  statut: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: "EN_ATTENTE"
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  dateEnvoi: {
    type: DataTypes.DATE,
    allowNull: true
  },
  dateReponse: {
    type: DataTypes.DATE,
    allowNull: true
  },
  motifRefus: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ReparationId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  creeParId: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: "devis",
  timestamps: true
});

module.exports = Devis;
