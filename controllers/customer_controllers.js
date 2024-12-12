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
const { Preferences } = require("../models/preference_model");
const { Email_logs } = require("../models/emailLogs_model");
const sequelize = require("../config/db");
const messages = require("../constants/messages");
const statusCode = require("../constants/statusCode");
const { sendEmail } = require("../services/email");
const jwtExpiringTime = "1h";
const cron = require("node-cron");
const moment = require("moment");
const { Op } = require("sequelize");
const { getMultipleVerses } = require("../api/quran");

const createCustomer = async (request, response, next) => {
  try {
    const { surname, othernames, email, password, phone } = request.body;
    const { error } = createCustomerValidation(request.body);
    if (error !== undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );

    const [customerExistence, tempCustomerExistence] = await Promise.all([
      Customers.findOne({ where: { email } }),
      TemporaryCustomers.findOne({ where: { email } }),
    ]);

    if (customerExistence != null) throw new Error(messages.CUSTOMER_EXIST);
    if (tempCustomerExistence != null) {
      const errData = new Error();
      errData.message =
        "An account with this email has already been created please verify with otp";
      errData.isVerify = messages.OTP_VERIFY_CODE;
      throw errData;
    }

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
    sendEmail(
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
    next(error);
  }
};

const verifyEmail = async (request, response, next) => {
  const transaction = await sequelize.transaction();
  try {
    const { email, otp } = request.params;
    const { error } = verifyEmailAndOtpValidation(request.params);
    if (error !== undefined) {
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    }
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
    sendEmail(
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
    await transaction.rollback();
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

    sendEmail(
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
    if (error !== undefined)
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
    if (error !== undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    // const updates = {};
    // if (data.surname && data.surname.trim() !== "")
    //   updates.surname = data.surname;
    // if (data.othernames && data.othernames.trim() !== "")
    //   updates.othernames = data.othernames;
    // if (data.phone && data.phone.trim() !== "") updates.phone = data.phone;
    // if (Object.keys(updates).length === 0)
    //   throw new Error("No valid fields provided for update.");
    await Customers.update(data, {
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
          "updated_at",
        ],
      },
    });

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
    sendEmail(
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
    sendEmail(
      email,
      "Hi , Your password has been reset successfully",
      "Password Reset Successful"
    );

    response.status(statusCode.OK).json({
      status: true,
      message: messages.PASSWORD_RESET_SUCCESS,
    });
  } catch (error) {
    next(error);
  }
};

const customerPreference = async (request, response, next) => {
  try {
    const { customer_id } = request.params;
    const {
      daily_verse_count,
      start_surah,
      start_verse,
      language,
      timezone,
      frequency,
      schedule_time,
    } = request.body;
    const { error } = preferenceValidation(request.body);
    if (error !== undefined)
      throw new Error(
        error.details[0].message || messages.SOMETHING_WENT_WRONG
      );
    const customer = await Customers.findOne({
      where: { customer_id: customer_id },
    });

    await Preferences.create({
      customer_id: customer_id,
      preference_id: uuidv4(),
      email: customer.dataValues.email,
      daily_verse_count: daily_verse_count,
      start_surah: start_surah,
      start_verse: start_verse,
      frequency: frequency,
      schedule_time: schedule_time,
      created_at: Date.now(),
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
const processEmail = async () => {
  try {
    const preferences = await Preferences.findAll({
      where: {
        schedule_time: "12:20:00",
        // schedule_time: {
        //   // [Op.lte]: moment().format("HH:mm:ss"),
        // },
      },
    });

    const preferencesData = preferences.map(
      (preference) => preference.dataValues
    );

    // Classic for loop
    for (let i = 0; i < preferencesData.length; i++) {
      const preference = preferencesData[i];
      const {
        customer_id,
        email,
        daily_verse_count,
        start_surah,
        frequency,
        schedule_time,
      } = preference;

      const lastEmail = await Email_logs.findOne({
        where: { customer_id },
      });
      let sendEmail = false;
      if (lastEmail === null) sendEmail = true;
      else {
        const now = moment();
        const lastSentDate = moment(lastEmail.dataValues.updated_at);
        const diffInDays = now.diff(lastSentDate, "days");
        if (frequency === "daily" && diffInDays >= 1) sendEmail = true;
        else if (frequency === "weekly" && diffInDays >= 7) sendEmail = true;
        else if (
          frequency === "monthly" &&
          now.month() !== lastSentDate.month()
        )
          sendEmail = true;
      }

      // if (sendEmail === true) {
      //   console.log("-----------------------------", typeof start_surah);
      // }
      // Logic to determine if an email should be sent based on frequency
      // if (!lastEmail) {
      //   sendEmail = true; // Send email if it's the first time
      // } else {
      //   const now = moment();
      //   const lastSentDate = moment(lastEmail.dataValues.updated_at);
      //   const diffInDays = now.diff(lastSentDate, "days");

      //   // Check the frequency and determine if we need to send an email
      //   if (frequency === "daily" && diffInDays >= 1) {
      //     sendEmail = true;
      //   } else if (frequency === "weekly" && diffInDays >= 7) {
      //     sendEmail = true;
      //   } else if (
      //     frequency === "monthly" &&
      //     now.month() !== lastSentDate.month()
      //   ) {
      //     sendEmail = true;
      //   }
      // }

      if (sendEmail) {
        const totalVersesInSurah = await getTotalVersesInSurah(start_surah);

        let startVerseForNextEmail = 1;
        if (lastEmail) {
          startVerseForNextEmail = lastEmail.dataValues.last_sent_verse + 1;
        }

        if (startVerseForNextEmail > totalVersesInSurah) {
          start_surah += 1;
        }

        const end_verse =
          startVerseForNextEmail + daily_verse_count - 1 > totalVersesInSurah
            ? totalVersesInSurah
            : startVerseForNextEmail + daily_verse_count - 1;

        const verses = await getMultipleVerses(
          start_surah,
          startVerseForNextEmail,
          daily_verse_count
        );
        console.log(
          `Sending email to customer: ${customer_id} with ${daily_verse_count}`
        );

        sendEmail(email, verses, "your verse for today");

        if (lastEmail) {
          await Email_logs.update({
            last_sent_surah: start_surah,
            last_sent_verse: end_verse,
            updated_at: new Date(),
            where: { customer_id },
          });
        } else {
          await Email_logs.create({
            customer_id,
            last_sent_surah: start_surah,
            last_sent_verse: end_verse,
            updated_at: new Date(),
          });
        }
      }
    }
  } catch (error) {
    console.error("Error processing email:", error);
  }
};

// Function to get the total number of verses in a surah
async function getTotalVersesInSurah(surah) {
  const surahTotalVerses = {
    1: 7, // Example for Surah Al-Fatiha
    2: 286, // Example for Surah Al-Baqarah
    3: 200, // Example for Surah Aal-e-Imran
    // Add other surahs as needed
  };

  return surahTotalVerses[surah];
}

cron.schedule("*/30 * * * *", async () => {
  console.log("Cron job started: Processing daily emails...");
  await processEmail();
  console.log("Cron job completed: Emails sent.");
});

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
