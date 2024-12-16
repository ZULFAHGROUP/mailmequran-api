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
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Customers",
        key: "email",
      },
    },
    daily_verse_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    start_surah: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    start_verse: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    is_language: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    timezone: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: "UTC",
    },
    frequency: {
      type: DataTypes.ENUM("daily", "weekly", "monthly"),
      allowNull: false,
    },
    schedule_time: {
      type: DataTypes.TIME,
      allowNull: true,
    },

    created_at: {
      type: DataTypes.DATE,
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
