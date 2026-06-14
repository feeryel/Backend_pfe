const { DataTypes } = require("sequelize");
const sequelize = require("../config/database");

const Notification = sequelize.define("Notification", {
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "utilisateurs",
      key: "id"
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  link: {
    type: DataTypes.STRING,
    allowNull: true
  },
  lu: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  tableName: "notifications",
  timestamps: true
});

module.exports = Notification;
