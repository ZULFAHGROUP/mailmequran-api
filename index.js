require("dotenv").config();
const cors = require("cors");
const express = require("express");
const app = express();
const displayRoutes = require("express-routemap");
const sequelize = require("./config/db");
const messages = require("./constants/messages");
const statusCode = require("./constants/statusCode");
const customerRoutes = require("./routes/customer_routes");
const options = {
  origin: "*",
  methods: "GET, POST, PATCH, DELETE,HEAD",
  exposedHeaders: ["access_token"],
};

app.use(express.json());
app.use(cors(options));
app.use(customerRoutes);

app.get("/", (request, response) => {
  response.status(statusCode.OK).json({
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

// error handling middleware
app.use((error, request, response, next) => {
  if (error.sqlMessage || error.sqlState) {
    return response.status(statusCode.INTERNAL_SERVER_ERROR).json({
      status: "failed",
      message: messages.SOMETHING_WENT_WRONG,
    });
  } else {
    if (error.isVerify) {
      return response.status(statusCode.BAD_REQUEST).json({
        status: "failed",
        message: error.message,
        isVerify: error.isVerify,
      });
    } else {
      return response.status(error.code || statusCode.BAD_REQUEST).json({
        status: "failed",
        message: error.message,
      });
    }
  }
});

// not found routes
app.use((request, response, next) => {
  response.status(404).json({
    status: "error",
    message: "You got lost",
  });
});
