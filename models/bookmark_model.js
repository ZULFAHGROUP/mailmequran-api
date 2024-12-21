const { Sequelize, DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Bookmark = sequelize.define(
  "Bookmark",
  {
    sn: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      allowNull: false,
      primaryKey: true,
    },
    bookmark_id: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    customer_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: "Customers",
        key: "customer_id",
      },
    },
    surah: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    verse: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },

    is_deleted: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
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
    tableName: "Bookmarks",
  }
);

module.exports = { Bookmark };
