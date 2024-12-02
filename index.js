require("dotenv").config();
const express = require("express");
const app = express();
const displayRoutes = require("express-routemap");
const sequelize = require("./config/db");
const messages = require("./constants");
const STATUS_CODES = require("./utils/statusCode");
const customerRoutes = require("./routes/customer_routes");

app.use(express.json());
app.use(customerRoutes);

app.get("/", (request, response) => {
  response.status(STATUS_CODES.OK).json({
    success: true,
    message: messages.WELCOME_MESSAGE,
  });
});

try {
  (async () => {
    await sequelize.authenticate();
    // await sequelize.sync({ force: true });
    console.log("Database connected successfully.");
    app.listen(process.env.APP_PORT, () => {
      displayRoutes(app);
      console.log(`Example app listening on port ${process.env.APP_PORT}`);
    });
  })();
} catch (error) {
  console.error("Unable to connect to the database:", error);
  process.exit(1);
}
