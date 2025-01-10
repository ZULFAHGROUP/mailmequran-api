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
    preference_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Preferences",
        key: "preference_id",
      },
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

    next_sending_date: {
      type: DataTypes.DATE,
      allowNull: false,
    },

    verse_completed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    surah_completed: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },

    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Email_logs",
    timestamps: false,
  }
);

module.exports = { Email_logs };
