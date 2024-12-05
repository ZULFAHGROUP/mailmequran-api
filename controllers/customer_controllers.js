const { generateOtp, comparePassword, generateJwtToken } = require("../utils");
const {
  createCustomerValidation,
  verifyEmailAndOtpValidation,
  resendOtpValidation,
  loginValidation,
  updateCustomerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  preferenceValidation,
} = require("../validations");
const { v4: uuidv4 } = require("uuid");
const { hashPassword } = require("../utils");
const { TemporaryCustomers } = require("../models/temporary_customers");
const { Otp } = require("../models/otp_model");
const { Customers } = require("../models/customer_model");
const { Preference, Preferences } = require("../models/preference_model");
const sequelize = require("../config/db");
const messages = require("../constants/messages");
const statusCode = require("../constants/statusCode");
const { sendEmail } = require("../services/email");
const jwtExpiringTime = "1h";

const createCustomer = async (request, response, next) => {
  try {
    const { surname, othernames, email, password, phone } = request.body;
    const { error } = createCustomerValidation(request.body);
    if (error != undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );

    const [customerExistence, tempCustomerExistence] = await Promise.all([
      Customers.findOne({ where: { email } }),
      TemporaryCustomers.findOne({ where: { email } }),
    ]);
    // const customerExistence = await Customers.findOne({
    //   where: { email: email },
    // });

    // const tempCustomerExistence = await TemporaryCustomers.findOne({
    //   where: { email },
    // });

    if (customerExistence != null) throw new Error(messages.CUSTOMER_EXIST);
    if (tempCustomerExistence != null)
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
    const { otp, expiresAt } = generateOtp();
    await Otp.create({
      email: email,
      otp_code: otp,
      expires_at: expiresAt,
    });
    await sendEmail(
      email,
      `<p><strong>Your verification code is:</strong> <strong>${otp}</strong></p>
      <p>Please use this code to verify your email address.</p>
    `,
      "MAIL ME QURAN Email Verification"
    );

    response.status(statusCode.CREATED).json({
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
    const { error } = verifyEmailAndOtpValidation(request.params);
    if (error != undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    const checkIfEmailAndOtpExist = await Otp.findOne({
      where: { email: email, otp_code: otp },
    });

    if (checkIfEmailAndOtpExist == null)
      throw new Error(messages.OTP_INVALID_OR_EXPIRED);

    const currentTime = new Date();
    const { expires_at } = checkIfEmailAndOtpExist.dataValues;
    if (currentTime > new Date(expires_at))
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
      `<p>Your email address has been successfully verified.</p>
      <p>Welcome to MAIL ME QURAN APP</p> `,
      "MAIL ME QURAN Email Verification Successful"
    );

    response.status(statusCode.OK).json({
      status: true,
      message: messages.CUSTOMER_CREATED,
    });
  } catch (error) {
    next(error);
  }
};

// Resend OTP route
const resendOtp = async (request, response, next) => {
  try {
    const { email } = request.params;
    const { error } = resendOtpValidation(request.params);
    const checkIfEmailAndOtpExist = await Otp.findOne({ where: { email } });
    if (checkIfEmailAndOtpExist == null)
      throw new Error("This process failed. Please try again");

    const currentTime = new Date();
    const { expires_at } = checkIfEmailAndOtpExist.dataValues;
    if (currentTime < new Date(expires_at))
      throw new Error("your OTP has not expired");

    const newOtp = checkIfEmailAndOtpExist.dataValues.otp_code;
    const { expiresAt } = generateOtp();

    await Otp.update({ expires_at: expiresAt }, { where: { email } });

    await sendEmail(
      email,
      `<p><strong>Your new verification code is:</strong> <strong>${newOtp}</strong></p>
      <p>Please use this code to verify your email address.</p>`
    );

    response
      .status(statusCode.OK)
      .json({ message: "New OTP generated and sent successfully." });
  } catch (error) {
    next(error);
  }
};

const login = async (request, response, next) => {
  try {
    const { email, password } = request.body;
    const { error } = loginValidation(request.body);
    if (error != undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    const customer = await Customers.findOne({ where: { email } });
    if (customer == null) throw new Error(messages.INVALID_CREDENTIALS);

    const match = await comparePassword(
      password,
      customer.dataValues.password_hash
    );

    if (!match) throw new Error(messages.INVALID_CREDENTIALS);

    const token = await generateJwtToken(email, jwtExpiringTime);
    response.setHeader("access_token", token);
    response.status(statusCode.OK).json({
      status: true,
      message: messages.LOGIN_SUCCESS,
      data: token,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomer = async (request, response, next) => {
  try {
    const { customer_id } = request.params;
    const data = request.body;
    const { error } = updateCustomerValidation(data);
    if (error != undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    const updates = {};
    if (data.surname && data.surname.trim() !== "")
      updates.surname = data.surname;
    if (data.othernames && data.othernames.trim() !== "")
      updates.othernames = data.othernames;
    if (data.phone && data.phone.trim() !== "") updates.phone = data.phone;
    if (Object.keys(updates).length === 0)
      throw new Error("No valid fields provided for update.");
    await Customers.update(updates, {
      where: {
        customer_id: customer_id,
      },
    });

    response.status(statusCode.OK).json({
      status: true,
      message: messages.CUSTOMER_UPDATED,
    });
  } catch (error) {
    next(error);
  }
};

const getCustomer = async (request, response, next) => {
  try {
    const { customer_id } = request.params;
    const customer = await Customers.findOne({
      where: { customer_id: customer_id },
      attributes: {
        exclude: [
          "sn",
          "customer_id",
          "password_hash",
          "password_salt",
          "is_email_verified",
          "created_at",
          "updated_at",
        ],
      },
    });
    if (customer == null) throw new Error(messages.CUSTOMER_NOT_FOUND);

    response.status(statusCode.OK).json({
      status: true,
      message: messages.CUSTOMER_FOUND,
      data: customer,
    });
  } catch (error) {
    next(error);
  }
};

const startForgetPassword = async (request, response, next) => {
  try {
    const { email } = request.params;

    const { error } = forgotPasswordValidation(request.params);
    if (error !== undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    const { otp, expiresAt } = generateOtp();
    await Otp.create({ email, otp_code: otp, expires_at: expiresAt });
    await sendEmail(
      email,
      `Hi , Your OTP is ${otp}. Please use this to reset your password`,
      "Password Reset"
    );

    response.status(statusCode.OK).json({
      status: true,
      message: "Forget Password request sent successfully",
    });
  } catch (error) {
    next(error);
  }
};

const completeForgetPassword = async (request, response, next) => {
  try {
    const { email, otp, newPassword } = request.body;
    const { error } = resetPasswordValidation(request.body);
    if (error !== undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    const checkIfEmailAndOtpExist = await Otp.findOne({
      where: { email: email, otp_code: otp },
    });

    if (checkIfEmailAndOtpExist == null)
      throw new Error(messages.OTP_INVALID_OR_EXPIRED);
    const currentTime = new Date();
    const { expires_at } = checkIfEmailAndOtpExist.dataValues;

    if (currentTime > new Date(expires_at))
      throw new Error(messages.OTP_INVALID_OR_EXPIRED);

    const customer = await Customers.findOne({ where: { email } });
    if (customer == null) throw new Error(messages.SOMETHING_WENT_WRONG);
    const [hash, salt] = await hashPassword(newPassword);
    await Customers.update(
      { password_hash: hash, password_salt: salt },
      { where: { email } }
    );
    await Otp.destroy({ where: { email, otp_code: otp } });
    await sendEmail(
      email,
      `Hi, \n\nYour password has been reset successfully.\n\nIf you did not perform this action, please contact our support team immediately.`,
      "Password Reset Successful"`Hi , Your password has been reset successfully`,
      "Password Reset Successful"
    );

    response.status(statusCode.OK).json({
      status: true,
      message: messages.PASSWORD_RESET_SUCCESSFUL,
    });
  } catch (error) {
    next(error);
  }
};

const customerPreference = async (request, response, next) => {
  try {
    const { customer_id } = request.params;
    const { language, timezone, frequency, time, verseCount } = request.body;
    const { error } = preferenceValidation(request.body);
    if (error !== undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    await Preferences.create({
      customer_id: customer_id,
      preference_id: uuidv4(),
      is_language: language,
      timezone: timezone,
      frequency: frequency,
      selected_time: time,
      verse_count: verseCount,
    });

    response.status(statusCode.OK).json({
      status: true,
      message: messages.CUSTOMER_PREFERENCE_CREATED,
    });
  } catch (error) {
    next(error);
  }
};

const updatePreference = async (request, response, next) => {
  try {
    const { customer_id } = request.params;
    const data = request.body;
    const { error } = preferenceValidation(data);
    if (error !== undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    const update = {};
    if (data.language && data.language.trim() !== "")
      update.is_language = data.language;
    if (data.timezone && data.timezone.trim() !== "")
      update.timezone = data.timezone;
    if (data.frequency && data.frequency.trim() !== "")
      update.frequency = data.frequency;
    if (data.time && data.time.trim() !== "") update.selected_time = data.time;
    if (data.verseCount && data.verseCount.trim() !== "")
      update.verse_count = data.verseCount;
    if (Object.keys(updates).length === 0)
      throw new Error("No valid fields provided for update.");
    await Preferences.update(
      { update },
      { where: { customer_id: customer_id } }
    );

    response.status(statusCode.OK).json({
      status: true,
      message: messages.CUSTOMER_PREFERENCE_UPDATED,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCustomer,
  verifyEmail,
  resendOtp,
  login,
  updateCustomer,
  getCustomer,
  startForgetPassword,
  completeForgetPassword,
  customerPreference,
  updatePreference,
};
