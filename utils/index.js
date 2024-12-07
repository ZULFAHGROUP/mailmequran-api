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

module.exports = {
  generateOtp,
  hashPassword,
  comparePassword,
  generateJwtToken,
};
