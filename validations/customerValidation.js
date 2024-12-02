const Joi = require("joi");

const createCustomerValidation = (data) => {
  const customerSchema = Joi.object({
    surname: Joi.string().required(),
    othernames: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    repeatPassword: Joi.string().valid(Joi.ref("password")).required(),
    phone: Joi.string().optional().allow(null),
  });

  return customerSchema.validate(data);
};

module.exports = createCustomerValidation;
