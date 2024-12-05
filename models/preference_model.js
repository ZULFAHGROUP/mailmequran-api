const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Preferences = sequelize.define(
  "Preference",
  {
    sn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    customer_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Customers",
        key: "customer_id",
      },
    },
    preference_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    is_language: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    frequency: {
      type: DataTypes.ENUM("daily", "weekly", "monthly"),
      allowNull: false,
    },
    selected_time: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    verse_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
      allowNull: false,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: new Date(),
      allowNull: false,
    },
  },
  {
    timestamps: false,
    updatedAt: false,
    tableName: "Preferences",
  }
);

module.exports = { Preferences };
