const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Otp = sequelize.define(
  "Otp",
  {
    sn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "TemporaryCustomers",
        key: "email",
      },
    },
    otp_code: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    timestamps: false,
    updatedAt: true,
    tableName: "Otp",
  }
);

module.exports = { Otp };
