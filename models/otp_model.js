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
      defaultValue: new Date(),
      allowNull: false,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    timestamps: false,
    updatedAt: false,
    tableName: "Otp",
  }
);

module.exports = { Otp };
