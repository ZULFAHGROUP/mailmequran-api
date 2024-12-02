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
const otpExpiringTimeInMinutes = 10;

const createCustomer = async (request, response, next) => {
  try {
    const { surname, othernames, email, password, phone } = request.body;
    const { error } = createCustomerValidation(request.body);
    if (error != undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );

    const [customer, tempCustomer] = await Promise.all([
      Customers.findOne({ where: { email } }),
      TemporaryCustomers.findOne({ where: { email } }),
    ]);

    if (customer != null) throw new Error(messages.CUSTOMER_EXIST);
    if (tempCustomer != null)
      throw new Error(
        "An account with this email has already been created please verify with otp"
      );

    const [hash, salt] = await hashPassword(password);
    await TemporaryCustomers.create({
      customer_id: uuidv4(),
      surname: surname,
      othernames: othernames,
      email: email,
      password_hash: hash,
      password_salt: salt,
      phone: phone,
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
    next(error);
  }
};

const verifyEmail = async (request, response, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { email, otp } = request.params;
    const checkIfEmailAndOtpExist = await Otp.findOne({
      where: { email: email, otp_code: otp },
    });

    if (checkIfEmailAndOtpExist == null)
      throw new Error(messages.OTP_INVALID_EXPIRED);

    const getOtpCreatedTime = new Date(
      checkIfEmailAndOtpExist.dataValues.created_at
    ).getTime(); //in milliseconds
    const todaysDate = new Date().getTime(); //in milliseconds

    const differenceInMIlliseconds = todaysDate - getOtpCreatedTime;
    const minutesDifference = Math.floor(
      differenceInMIlliseconds / (1000 * 60)
    ); //convert to minutes
    console.log("minutes difference: ", minutesDifference);
    if (minutesDifference > otpExpiringTimeInMinutes)
      throw new Error(messages.OTP_INVALID_OR_EXPIRED);

    const tempCustomer = await TemporaryCustomers.findOne({
      where: { email: email },
    });
    if (tempCustomer == null)
      throw new Error("The verification process failed. Please try again");

    await Customers.create(
      {
        customer_id: tempCustomer.customer_id,
        surname: tempCustomer.surname,
        othernames: tempCustomer.othernames,
        email: tempCustomer.email,
        phone: tempCustomer.phone,
        is_email_verified: true,
        password_hash: tempCustomer.password_hash,
        password_salt: tempCustomer.password_salt,
        created_at: tempCustomer.created_at,
      },
      { transaction }
    );

    await Otp.destroy({ where: { email }, transaction });
    await tempCustomer.destroy({ transaction });

    await transaction.commit();

    //send email
    await sendEmail(
      email,
      `<p>Your email address has been successfully verified.</p>`,
      "MAIL ME QURAN Email Verification Successful"
    );

    response.status(STATUS_CODES.OK).json({
      status: true,
      message: messages.CUSTOMER_CREATED,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  verifyEmail,
};
