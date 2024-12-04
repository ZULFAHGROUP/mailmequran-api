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
    surname: Joi.string().min(3).max(50).allow("", null),
    othernames: Joi.string().min(3).max(50).allow("", null),
    phone: Joi.string().allow("", null),
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
      .valid(Joi.ref("password"))
      .required(),
  });

  return resetPasswordSchema.validate(data);
};

module.exports = {
  createCustomerValidation,
  verifyEmailAndOtpValidation,
  resendOtpValidation,
  loginValidation,
  updateCustomerValidation,
  forgotPasswordValidation,
};
