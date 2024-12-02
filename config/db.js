const { Sequelize } = require("sequelize");
const DATABASE_NAME = process.env.DATABASE_NAME || "database";
const DATABASE_USER = process.env.DATABASE_USER || "username";
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD || "";
const DATABASE_HOST = process.env.DATABASE_HOST || "localhost";

const sequelize = new Sequelize(
  DATABASE_NAME,
  DATABASE_USER,
  DATABASE_PASSWORD,

  {
    host: DATABASE_HOST,
    dialect: "postgres",
  }
);

module.exports = sequelize;
