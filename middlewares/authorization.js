const jwt = require("jsonwebtoken");
const { Customers } = require("../models/customer_model");
const messages = require("../constants/messages");
const statusCode = require("../constants/statusCode");
const authorization = (request, response, next) => {
  try {
    const { token } = request.headers;
    if (!token) throw new Error(messages.UNAUTHORIZED);
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        return response.status(statusCode.UNAUTHORIZED).json({
          status: "error",
          message: messages.UNAUTHORIZED,
        });
      }

      const email = decoded.email;
      //use the email to fetch the customer_id
      const data = await Customers.findOne({ where: { email: email } });
      if (data == null) {
        return response.status(statusCode.UNAUTHORIZED).json({
          status: "error",
          message: messages.UNAUTHORIZED,
        });
      }

      request.params.customer_id = data.dataValues.customer_id;
      request.params.email = data.dataValues.email;
      next();
    });
  } catch (error) {
    response.status(statusCode.UNAUTHORIZED).json({
      status: "error",
      message: messages.UNAUTHORIZED,
    });
  }
};

module.exports = {
  authorization,
};
