require("dotenv").config();
const express = require("express");
const app = express();
const displayRoutes = require("express-routemap");
const sequelize = require("./config/db");
const response = require("./utils/response");
const message = require("./utils/messages");
const STATUS_CODES = require("./utils/statusCode");

app.use(express.json());

app.get("/", (req, res) => {
  response(res, STATUS_CODES.OK, true, message.SUCCESS.WELCOME);
});

try {
  (async () => {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
    app.listen(process.env.APP_PORT, () => {
      displayRoutes(app);
      console.log(`Example app listening on port ${process.env.APP_PORT}`);
    });
  })();
} catch (error) {
  console.error("Unable to connect to the database:", error);
  process.exit(1);
}
