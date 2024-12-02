const { generateOtp } = require("../utils");
const createCustomerValidation = require("../validations/customerValidation");
const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../utils");
const { TemporaryCustomers } = require("../models/temporary_customers");
const { Otp } = require("../models/otp_model");
const Customers = require("../models/customer_model");
const sequelize = require("../config/db");
const messages = require("../constants");
const STATUS_CODES = require("../utils/statusCode");
const { sendEmail } = require("../services/email");

const createCustomer = async (request, response, next) => {
  try {
    const { surname, othernames, email, password } = req.body;
    const { error } = createCustomerValidation(req.body);
    if (error != undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );

    const checkIfEmailExist = await Customers.findOne({
      where: { email: email },
    });
    if (checkIfEmailExist != null) throw new Error(messages.CUSTOMER_EXIST);
    const [hash, salt] = await hashPassword(password);
    await TemporaryCustomers.create({
      customer_id: uuidv4(),
      surname: surname,
      othernames: othernames,
      email: email,
      password_hash: hash,
      password_salt: salt,
    });
    const otp = generateOtp();
    await Otp.create({
      email: email,
      otp_code: otp,
    });
    await sendEmail(
      email,
      `<p><strong>Your verification code is:</strong> <strong>${otp}</strong></p>
      <p>Please use this code to verify your email address.</p>
    `,
      "MAIL ME QURAN Email Verification"
    );

    response.status(STATUS_CODES.CREATED).json({
      success: true,
      message: messages.OTP_SENT,
    });
  } catch (error) {
    console.log("error: ", error);
    // next(error);
  }
};

module.exports = {
  createCustomer,
};
