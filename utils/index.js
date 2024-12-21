const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRound = 10;
const { v4: uuidv4 } = require("uuid");
const { Frequency } = require("../enum");
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

const formatVersesWithEnglishAndArabic = (verses) => {
  return verses
    .map(
      (verse) => `
        <div style="font-family: Arial, sans-serif; margin-bottom: 20px;">
          <h3 style="color: #2c3e50;">Chapter: ${verse.chapter}, Verse: ${verse.verse}</h3>
          <p style="font-size: 54px; color: #8e44ad;">
            <strong>Arabic:</strong> ${verse.ar}
          </p>
          <p style="font-size: 16px; color: #34495e;">
            <strong>English:</strong> ${verse.en}
          </p>
          <p style="font-size: 14px; color: #7f8c8d;">
            <strong>Translator:</strong> ${verse.translator}
          </p>
        </div>
      `
    )
    .join("");
};

const formatVersesWithArabic = (verses) => {
  return verses
    .map(
      (verse) => `
        <div style="font-family: Arial, sans-serif; margin-bottom: 20px;">
          <h3 style="color: #2c3e50;">Chapter: ${verse.chapter}, Verse: ${verse.verse}</h3>
          <p style="font-size: 54px; color: #8e44ad;">
            <strong>Arabic:</strong> ${verse.ar}
          </p>
        </div>
      `
    )
    .join("");
};

// const formatDailyVerseEmail = (verse) => {
//   return `
//     <div style="font-family: Arial, sans-serif; margin: 0 auto; max-width: 600px; padding: 20px; background-color: #f9f9f9; border-radius: 10px; box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.1);">
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
  const now = moment(); // Current date without timezone
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

module.exports = {
  generateOtp,
  hashPassword,
  comparePassword,
  generateJwtToken,
  formatVersesWithEnglishAndArabic,
  formatVersesWithArabic,
  getTotalVersesInSurah,
  calculateNextSendingDate,
};
