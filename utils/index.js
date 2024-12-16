const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const saltRound = 10;
const { v4: uuidv4 } = require("uuid");
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

function getTotalVersesInSurah(surah) {
  const surahTotalVerses = {
    1: 7,
    2: 286,
    3: 200,
  };

  return surahTotalVerses[surah];
}

module.exports = {
  generateOtp,
  hashPassword,
  comparePassword,
  generateJwtToken,
  formatVersesWithEnglishAndArabic,
  formatVersesWithArabic,
  getTotalVersesInSurah,
};
