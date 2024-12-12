const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Email_logs = sequelize.define(
  "Email_logs",
  {
    sn: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    customer_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Customers",
        key: "customer_id",
      },
    },
    last_sent_surah: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    last_sent_verse: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    tableName: "Email_logs",
    timestamps: false,
  }
);

module.exports = { Email_logs };
