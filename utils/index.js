const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRound = 10;
const { v4: uuidv4 } = require("uuid");
const { Frequency } = require("../enum");
const sequelize = require("../config/db");
const moment = require("moment");
const { Email_logs } = require("../models/emailLogs_model");
const { Preferences } = require("../models/preference_model");

const generateOtp = (expiresInMinutes = 10) => {
  const otp = Math.floor(100000 + Math.random() * 900000);
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  return { otp, expiresAt };
};

const hashPassword = async (password) => {
  return new Promise((resolve, reject) => {
    bcrypt.genSalt(saltRound, (err, salt) => {
      if (err) reject(err);
      bcrypt.hash(password, salt, (err, hash) => {
        if (err) reject(err);
        resolve([hash, salt]);
      });
    });
  });
};

const comparePassword = (password, hash) => {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, hash, (err, result) => {
      if (err) reject(err);
      resolve(result);
      return result;
    });
  });
};

const generateJwtToken = (email, expiringTime) => {
  const token = jwt.sign(
    { _id: uuidv4(), email: email },
    process.env.JWT_SECRET,
    { expiresIn: expiringTime }
  );
  return token;
};

const formatOtpMessage = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border: 1px solid #ddd; border-radius: 8px; max-width: 500px; margin: auto; text-align: center;">
      <h2 style="color: #34495e;">Your Verification Code</h2>
      <p style="font-size: 18px; color: #2c3e50; margin: 10px 0;">
        Use the code below to complete your email verification:
      </p>
      <p style="font-size: 40px; font-weight: bold; color: #e74c3c; margin: 20px 0;">
        ${otp}
      </p>
      <p style="font-size: 18px; color: #95a5a6; margin: 10px 0;">
        This code is valid for the next 10 minutes. Please do not share it with anyone.
      </p>
    </div>
  `;
};

const formatVerificationMessage = () => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f9; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: auto; text-align: center;">
      <h1 style="color: #4a90e2; font-size: 32px; margin-bottom: 10px;">Email Verified Successfully!</h1>
      <p style="font-size: 16px; color: #333; line-height: 1.5; margin: 10px 0;">
        Your email address has been successfully verified.
      </p>
      <p style="font-size: 18px; color: #2c3e50; font-weight: bold; margin: 20px 0;">
        Welcome to <span style="color: #e74c5c;">MAIL ME QURAN APP</span>!
      </p>
      <p style="font-size: 14px; color: #7f8c8d; margin: 10px 0;">
        We're delighted to have you join us. Explore the app and enhance your Quranic learning journey.
      </p>
    </div>
  `;
};

const formatPasswordResetMessage = (otp) => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f4f9; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: auto; text-align: center;">
      <h2 style="color: #4a90e2; font-size: 24px; margin-bottom: 20px;">Password Reset Request</h2>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Hi, Your OTP is:
      </p>
      <p style="font-size: 36px; font-weight: bold; color: #e74c3c; margin: 20px 0;">
        ${otp}
      </p>
      <p style="font-size: 14px; color: #7f8c8d; margin-top: 20px;">
        Please use this OTP to reset your password. This code will expire in 10 minutes.
      </p>
      <p style="font-size: 12px; color: #bdc3c7; margin-top: 10px;">
        If you did not request a password reset, you can safely ignore this message.
      </p>
    </div>
  `;
};

const formatPasswordResetSuccessMessage = () => {
  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f9f9f9; border: 1px solid #e0e0e0; border-radius: 8px; max-width: 600px; margin: auto; text-align: center;">
      <h2 style="color: #27ae60; font-size: 24px; margin-bottom: 20px;">Password Reset Successful</h2>
      <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
        Hi, your password has been reset successfully.
      </p>
      <p style="font-size: 14px; color: #7f8c8d; margin-top: 20px;">
        If you did not make this change, please contact our support team immediately to secure your account.
      </p>
      <p style="font-size: 12px; color: #bdc3c7; margin-top: 10px;">
        Thank you for using our service.
      </p>
    </div>
  `;
};

const formatQuranEmailTemplate = (verses, showEnglish) => {
  return `<div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; background-color: #ffffff; padding: 2rem">
      <div style="font-size: 1.5rem; background-color: skyblue; padding: 10px;">logo</div>
      
      <!-- Image Section -->
      <div style="text-align: center; margin-top: 10px;">
        <img src="../../constants/emailTemplate.png" alt="Quranic Scene" style="max-width: 100%; height: auto; border-radius: 8px;">
      </div>

      <!-- Header Section -->
      <div style="padding: 20px; text-align: center; background-color: #f9f9f9;">
        <h1 style="color: #2c3e50; font-size: 24px; margin: 0;">Your Daily Dose of Quranic Reflections</h1>
        <p style="color: #7f8c8d; font-size: 14px; margin: 5px 0;">Connecting you to the Quran, one verse at a time.</p>
      </div>

      <!-- Verses Section -->
      ${verses
        .map(
          (verse) => `
          <div style="font-family: Arial, sans-serif; margin-bottom: 20px;">
            <h3 style="color: #2c3e50;">Chapter: ${verse.chapter}, Verse: ${
            verse.verse
          }</h3>
            
            <p style="font-size: 54px; color: #8e44ad; text-align: right;">
              <strong>Arabic:</strong> ${verse.ar}
            </p>
            
            ${
              showEnglish
                ? `
              <p style="font-size: 16px; color: #34495e; text-align: left;">
                <strong>English:</strong> ${verse.en}
              </p>
            `
                : ""
            }
          </div>
        `
        )
        .join("")}
      
      <!-- Footer Section -->
      <div style="padding: 20px; text-align: center; background-color: #f9f9f9; border-top: 1px solid #ddd;">
        <p style="font-size: 12px; color: #7f8c8d;">May Allah (SWT) bless you for taking the time to connect with His words</p>
        <button style="padding: 10px 15px; font-size: 12px; color: #fff; background-color: #e74c3c; border: none; border-radius: 4px; cursor: pointer;">Unsubscribe</button>
      </div>
    </div>`;
};

//       <div style="text-align: center; margin-bottom: 20px;">
//         <h2 style="color: #2c3e50; margin-bottom: 10px;">Your Daily Dose of Quranic Verses</h2>
//         <p style="color: #7f8c8d; font-size: 14px;">Connecting you to the Quran, one verse at a time.</p>
//       </div>
//       <!-- Verse Section -->
//       <div style="margin-bottom: 20px; text-align: center;">
//         <h3 style="color: #2c3e50; font-size: 18px; margin-bottom: 10px;">
//           Surah: ${verse.chapter}, Verse: ${verse.verse}
//         </h3>
//         <p style="font-size: 32px; color: #27ae60; line-height: 1.5;">
//           <strong>${verse.ar}</strong>
//         </p>
//         <p style="font-size: 16px; color: #34495e; margin-top: 10px; line-height: 1.5;">
//           <em>"${verse.en}"</em>
//         </p>
//       </div>

//       <div style="margin-bottom: 20px; text-align: left;">
//         <h4 style="color: #2c3e50;">Reflective Question:</h4>
//         <p style="font-size: 14px; color: #7f8c8d;">
//           "How can you apply this verse in your life today?"
//         </p>
//       </div>
//       <div style="text-align: center; margin-top: 20px;">
//         <a href="https://mailmequran/settings" style="background-color: #28a745; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-right: 10px; font-size: 14px;">
//           Update Delivery Settings
//         </a>
//         <a href="https://mailmequran/unsubscribe" style="background-color: #e74c3c; color: #ffffff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-size: 14px;">
//           Unsubscribe
//         </a>
//       </div>
//        <div style="text-align: center; margin-top: 20px; color: #95a5a6; font-size: 12px;">
//         <p>May Allah (SWT) bless you for connecting with His words.</p>
//       </div>
//     </div>
//   `;
// };

function getTotalVersesInSurah(surah) {
  const surahTotalVerses = {
    1: 7,
    2: 286,
    3: 200,
    4: 176,
    5: 120,
    6: 165,
    7: 206,
    8: 75,
    9: 129,
    10: 109,
    11: 123,
    12: 111,
    13: 43,
    14: 52,
    15: 99,
    16: 128,
    17: 111,
    18: 110,
    19: 98,
    20: 135,
    21: 112,
    22: 78,
    23: 118,
    24: 64,
    25: 77,
    26: 227,
    27: 93,
    28: 88,
    29: 69,
    30: 60,
    31: 34,
    32: 30,
    33: 73,
    34: 54,
    35: 45,
    36: 83,
    37: 182,
    38: 88,
    39: 75,
    40: 85,
    41: 54,
    42: 53,
    43: 89,
    44: 59,
    45: 37,
    46: 35,
    47: 38,
    48: 29,
    49: 18,
    50: 45,
    51: 60,
    52: 49,
    53: 62,
    54: 55,
    55: 78,
    56: 96,
    57: 29,
    58: 22,
    59: 24,
    60: 13,
    61: 14,
    62: 11,
    63: 11,
    64: 18,
    65: 12,
    66: 12,
    67: 30,
    68: 52,
    69: 52,
    70: 44,
    71: 28,
    72: 28,
    73: 20,
    74: 56,
    75: 40,
    76: 31,
    77: 50,
    78: 40,
    79: 46,
    80: 42,
    81: 29,
    82: 19,
    83: 36,
    84: 25,
    85: 22,
    86: 17,
    87: 19,
    88: 26,
    89: 30,
    90: 20,
    91: 15,
    92: 21,
    93: 11,
    94: 8,
    95: 8,
    96: 19,
    97: 5,
    98: 8,
    99: 8,
    100: 11,
    101: 11,
    102: 8,
    103: 3,
    104: 9,
    105: 5,
    106: 4,
    107: 7,
    108: 3,
    109: 6,
    110: 3,
    111: 5,
    112: 4,
    113: 5,
    114: 6,
  };

  return surahTotalVerses[surah];
}

const calculateNextSendingDate = (frequency) => {
  const now = moment();
  let nextSendingDate = now;

  if (frequency === Frequency.DAILY) {
    nextSendingDate = now.add(1, "day");
  } else if (frequency === Frequency.WEEKLY) {
    nextSendingDate = now.add(1, "week");
  } else if (frequency === Frequency.MONTHLY) {
    nextSendingDate = now.add(1, "month");
  }

  return nextSendingDate.format("YYYY-MM-DD");
};

const fetchLogsAndPreferences = async () => {
  try {
    // Get today's date and current hour using Moment.js
    const today = moment().format("YYYY-MM-DD");
    const currentHour = moment().hour();

    // Query to fetch logs and preferences in one call
    const query = `
      SELECT e.*, p.*
      FROM "Email_logs" e
      INNER JOIN "Preferences" p ON e.preference_id = p.preference_id
      WHERE e.next_sending_date = :today
      AND EXTRACT(HOUR FROM p.schedule_time) = :currentHour
    `;

    const [results] = await sequelize.query(query, {
      replacements: { today, currentHour },
      type: sequelize.QueryTypes.SELECT,
    });

    console.log("Logs and Preferences:", results);
    return results;
  } catch (error) {
    console.error("Error fetching logs and preferences:", error);
    throw error;
  }
};

module.exports = {
  generateOtp,
  hashPassword,
  comparePassword,
  generateJwtToken,
  formatOtpMessage,
  formatVerificationMessage,
  formatPasswordResetMessage,
  formatPasswordResetSuccessMessage,
  getTotalVersesInSurah,
  calculateNextSendingDate,
  fetchLogsAndPreferences,
  formatQuranEmailTemplate,
};
