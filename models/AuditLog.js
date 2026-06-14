const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const AuditLog = sequelize.define("AuditLog", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  userLogin: {
    type: DataTypes.STRING,
    allowNull: true
  },
  action: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entity: {
    type: DataTypes.STRING,
    allowNull: false
  },
  entityId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  details: {
    type: DataTypes.TEXT,
    allowNull: true
  }
}, {
  tableName: "audit_logs",
  timestamps: true
});

module.exports = AuditLog;
