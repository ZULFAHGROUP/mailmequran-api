const Joi = require("joi");

const createCustomerValidation = (data) => {
  const customerSchema = Joi.object({
    surname: Joi.string().required(),
    othernames: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string()
      .min(6)
      .pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=^\S+$).{6,}$/)
      .required(),
    repeatPassword: Joi.string()
      .min(6)
      .pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=^\S+$).{6,}$/)
      .valid(Joi.ref("password"))
      .required(),
    phone: Joi.string().optional().allow(null, ""),
  });

  return customerSchema.validate(data);
};

const verifyEmailAndOtpValidation = (data) => {
  const verifyEmailAndOtpSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
  });

  return verifyEmailAndOtpSchema.validate(data);
};

//resend otp validation with just email
const resendOtpValidation = (data) => {
  const resendOtpSchema = Joi.object({
    email: Joi.string().email().required(),
  });

  return resendOtpSchema.validate(data);
};

//login validation
const loginValidation = (data) => {
  const loginScheme = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string()
      .pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=^\S+$).{6,}$/)
      .required(),
  });

  return loginScheme.validate(data);
};

//update customer account
const updateCustomerValidation = (data) => {
  const updateCustomerSchema = Joi.object({
    surname: Joi.string().min(3).optional(),
    othernames: Joi.string().min(3).optional(),
    phone: Joi.string().optional(),
  });

  return updateCustomerSchema.validate(data);
};

//forgot password validation

const forgotPasswordValidation = (data) => {
  const forgotPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
  });

  return forgotPasswordSchema.validate(data);
};

//reset password validation

const resetPasswordValidation = (data) => {
  const resetPasswordSchema = Joi.object({
    email: Joi.string().email().required(),
    otp: Joi.string().length(6).required(),
    newPassword: Joi.string()
      .min(6)
      .pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=^\S+$).{6,}$/)
      .required(),
    repeatPassword: Joi.string()
      .min(6)
      .pattern(/^(?=.*[!@#$%^&*(),.?":{}|<>])(?=^\S+$).{6,}$/)
      .valid(Joi.ref("newPassword"))
      .required(),
  });

  return resetPasswordSchema.validate(data);
};

const preferenceValidation = (data) => {
  const preferenceSchema = Joi.object({
    daily_verse_count: Joi.number().integer().positive().required(),
    start_surah: Joi.number().integer().positive().required(),
    start_verse: Joi.number().integer().positive().required(),
    is_language: Joi.string().optional(),
    timezone: Joi.string().max(100).required(),
    frequency: Joi.string().valid("daily", "weekly", "monthly").required(),
    schedule_time: Joi.string()
      .pattern(/^([01]\d|2[0-3]):([0-5]\d):([0-5]\d)$/, "HH:mm:ss")
      .required(),
  });
  return preferenceSchema.validate(data);
};

const updatePreferenceValidation = (data) => {
  const updatePreferenceSchema = Joi.object({});

  return updatePreferenceSchema.validate(data);
};

module.exports = {
  createCustomerValidation,
  verifyEmailAndOtpValidation,
  resendOtpValidation,
  loginValidation,
  updateCustomerValidation,
  forgotPasswordValidation,
  resetPasswordValidation,
  preferenceValidation,
  updatePreferenceValidation,
};
