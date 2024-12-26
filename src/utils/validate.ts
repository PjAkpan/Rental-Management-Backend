/* eslint-disable camelcase */
import Joi, { ObjectSchema } from "joi";
import { constants } from "../constants";
import moment from "moment";

const validateMobileSigninInput = (data: unknown) => {
  const schema: ObjectSchema = Joi.object({
    deviceId: Joi.string().required(),
    pin: Joi.string().required(),
  });

  return schema.validate(data);
};
const validateSigninInput = (data: unknown) => {
  const schema: ObjectSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    ipAddress: Joi.string().optional().allow(""),
    deviceId: Joi.string().required().messages({
      "string.base": "Device ID must be a string.",
      "any.required": "Device ID is required.",
    }),
    // deviceId: Joi.string().when("channel", {
    //   is: "mobile",
    //   then: Joi.string().required(),
    //   otherwise: Joi.string().optional().allow(""),
    // }),
    // channel: Joi.string().required(),
  });

  return schema.validate(data);
};
const addusersInputValidation = (data: unknown) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).max(100).required().messages({
      "string.base": "Fullname must be a string.",
      "string.min": "Fullname must be at least 3 characters long.",
      "string.max": "Fullname must be less than 100 characters long.",
      "any.required": "Fullname is required.",
    }),

    phoneNumber: Joi.string()
      .regex(/^(?:\+?\d{10,14}|\d{11})$/) // Ensures valid phone number formats
      .optional()
      .allow("")
      .messages({
        "string.pattern.base":
          "Phone number must be a valid international or local format.",
        "any.required": "Phone number is required.",
      }),

    deviceId: Joi.string().required().messages({
      "string.base": "Device ID must be a string.",
      "any.required": "Device ID is required.",
    }),

    profileImage: Joi.string().uri().optional().messages({
      "string.base": "Profile image must be a string.",
      "string.uri": "Profile image must be a valid URI.",
    }),

    email: Joi.string().email().required(),
    password: Joi.string()
      .regex(
        constants.validators.validateSignupInput.patterns.password,
        "password",
      )
      .min(6)
      .max(15)
      .required()
      .messages({
        "string.pattern.base":
          constants.validators.validateSignupInput.messages.failedToMatchBase,
        "string.pattern.name":
          constants.validators.validateSignupInput.messages
            .failedToMatchPattern,
      }),
    password2: Joi.any()
      .equal(Joi.ref("password"))
      .required()
      .label("Confirm password")
      .options({
        messages: {
          "any.only":
            constants.validators.validateSignupInput.patterns.passwordMissMatch,
        },
      }),
    ipAddress: Joi.string().optional().allow(""),
    roomNumber: Joi.string().optional().allow("", null).messages({
      "string.base": "Room number must be a string.",
    }),
  });
  return schema.validate(data);
};

const updateusersInputValidation = (data: unknown) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    ipAddress: Joi.string().optional().allow(""),
    bvn: Joi.string().optional().allow(""),
    nin: Joi.string().optional().allow(""),
    fullName: Joi.string().optional().allow(""),
    phoneNumber: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
    homeAddress: Joi.string().optional().allow(""),
    status: Joi.boolean().optional().allow(""),
    deviceId: Joi.string().optional().allow(""),
    profileImage: Joi.string().optional().allow(""),
    fcmToken: Joi.string().optional().allow(""),
    occupation: Joi.string().optional().allow(""),
  });
  return schema.validate(data);
};

const sendOtpInputValidation = (data: unknown) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
  });
  return schema.validate(data);
};

const ValidateviewAllValidation = (data: unknown) => {
  const schema = Joi.object({
    status: Joi.string()
      .optional()
      .allow("")
      .valid("pending", "active", "disabled"),
    orderBy: Joi.string().optional().allow(""),
    sort: Joi.string().optional().allow("").valid("ASC", "DESC"),
    size: Joi.string().optional().allow(""),
    page: Joi.string().optional().allow(""),
    gSearch: Joi.any().optional().allow(""),
    option: Joi.any().optional().allow(""),
    requestType: Joi.string()
      .optional()
      .allow("")
      .valid("DOMI", "EXPORT", "IEMARKET", "rollOver", "liquidate"),
    startDate: Joi.string()
      .optional()
      .allow("")
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .message("startDate must be in the format YYYY-MM-DD"),

    endDate: Joi.string()
      .optional()
      .allow("")
      .regex(/^\d{4}-\d{2}-\d{2}$/)
      .message("endDate must be in the format YYYY-MM-DD"),
  });
  return schema.validate(data);
};

const ValidateViewBankAllValidation = (data: unknown) => {
  const schema = Joi.object({
    pay_with_bank_transfer: Joi.string().optional().allow(""),
    country: Joi.string().optional().allow(""),
    use_cursor: Joi.string().optional().allow(""),
    perPage: Joi.string().optional().allow(""),
    next: Joi.string().optional().allow(""),
    previous: Joi.string().optional().allow(""),
    gateway: Joi.string().optional().allow(""),
  });
  return schema.validate(data);
};

const validateBankAccountVerifyinInput = (data: unknown) => {
  const schema = Joi.object({
    accountNumber: Joi.alternatives()
      .try(Joi.string(), Joi.number())
      .required(),
    bankCode: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  });
  return schema.validate(data);
};

const validateUserLogoutinInput = (data: unknown) => {
  const schema = Joi.object({
    userId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  });
  return schema.validate(data);
};

const addpinInputValidation = (data: unknown) => {
  const schema = Joi.object({
    userId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
    deviceId: Joi.string().required(),
    pin: Joi.string().required(),
  });
  return schema.validate(data);
};

const updatepinInputValidation = (data: unknown) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
    pin: Joi.number().required(),
  });
  return schema.validate(data);
};
const updateotpInputValidation = (data: unknown) => {
  const schema = Joi.object({
    deviceId: Joi.string().optional().allow(""),
    initiatorId: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
  });
  return schema.validate(data);
};

const addotpInputValidation = (data: unknown) => {
  const schema = Joi.object({
    deviceId: Joi.string().optional().allow(""),
    initiatorId: Joi.string().optional().allow(""),
    email: Joi.string().email().optional().allow(""),
  });
  return schema.validate(data);
};

const validateOtpVerifyInput = (data: unknown) => {
  const schema: ObjectSchema = Joi.object({
    referenceId: Joi.string().optional().allow(""),
    // email: Joi.string().email().required().messages({
    //   "string.base": "Email must be a string.",
    //   "string.email": "Email must be a valid email address.",
    //   "any.required": "Email is required.",
    // }),
    otp: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  });

  return schema.validate(data);
};

const resendOtpInputValidation = (data: unknown) => {
  const schema = Joi.object({
    email: Joi.string().email().required().messages({
      "string.base": "Email must be a string.",
      "string.email": "Email must be a valid email address.",
      "any.required": "Email is required.",
    }),
    deviceId: Joi.string().optional().allow("").messages({
      "string.base": "Device ID must be a string.",
    }),
  });

  return schema.validate(data);
};

const addmaintenanceInputValidation = (data: unknown) => {
  const schema = Joi.object({
    subject: Joi.string().required(),
    userId: Joi.string().required(),
    description: Joi.string().required(),
    pictureProof: Joi.string().optional().allow(""),
    videoProof: Joi.string().optional().allow(""),
  });
  return schema.validate(data);
};

const updatemaintenanceInputValidation = (data: unknown) => {
  const schema = Joi.object({
    requestId: Joi.string().required(),
    subject: Joi.string().optional().allow(""),
    description: Joi.string().optional().allow(""),
    pictureProof: Joi.string().optional().allow(""),
    videoProof: Joi.string().optional().allow(""),
  });
  return schema.validate(data);
};

const addTenancyPaymentInputValidation = (data: unknown) => {
  const schema = Joi.object({
    userId: Joi.string().required(),
  });
  return schema.validate(data);
};

const addRentPaymentInputValidation = (data: unknown) => {
  const schema = Joi.object({
    roomNumber: Joi.string().required(),
    userId: Joi.string().required(),
    paymentAmount: Joi.string().required(),
    paymentDate: Joi.alternatives()
      .try(
        Joi.date().raw().required(), // Accepts JavaScript `Date` objects.
        Joi.string().custom((value, helpers) => {
          if (
            moment(value, "DD-MM-YYYY", true).isValid() || // Format: DD-MM-YYYY
            moment(value, "YYYY-MM-DD", true).isValid() || // Format: YYYY-MM-DD
            moment(value, "DD/MM/YYYY", true).isValid() || // Format: DD/MM/YYYY
            moment(value, "YYYY/MM/DD", true).isValid() // Format: YYYY/MM/DD
          ) {
            return value;
          }
          return helpers.error("any.invalid", { value });
        }),
      )
      .messages({
        "any.invalid":
          "\"paymentDate\" must be a valid date object or a string in \"DD-MM-YYYY\", \"YYYY-MM-DD\", \"DD/MM/YYYY\", \"YYYY/MM/DD\", format.",
      }),
  });
  return schema.validate(data);
};

const updateRentPaymentInputValidation = (data: unknown) => {
  const schema = Joi.object({
    requestId: Joi.string().required(),
    roomNumber: Joi.string().optional().allow(""),
    status: Joi.string()
      .optional()
      .allow("")
      .valid("pending", "active", "due", "suspended"),
    userId: Joi.string().optional().allow(""),
    paymentAmount: Joi.string().optional().allow(""),
    // pictureProof: Joi.string().optional().allow(""),
    paymentDate: Joi.alternatives()
      .try(
        Joi.date().raw().optional().allow(""), // Accepts JavaScript `Date` objects.
        Joi.string().custom((value, helpers) => {
          if (
            moment(value, "DD-MM-YYYY", true).isValid() || // Format: DD-MM-YYYY
            moment(value, "YYYY-MM-DD", true).isValid() || // Format: YYYY-MM-DD
            moment(value, "DD/MM/YYYY", true).isValid() || // Format: DD/MM/YYYY
            moment(value, "YYYY/MM/DD", true).isValid() // Format: YYYY/MM/DD
          ) {
            return value;
          }
          return helpers.error("any.invalid", { value });
        }),
      )
      .messages({
        "any.invalid":
          "\"paymentDate\" must be a valid date object or a string in \"DD-MM-YYYY\", \"YYYY-MM-DD\", \"DD/MM/YYYY\", \"YYYY/MM/DD\", format.",
      }),
  });
  return schema.validate(data);
};

const addaccountDetailsInputValidation = (data: unknown) => {
  const schema = Joi.object({
    bankName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    accountName: Joi.string().required(),
  });
  return schema.validate(data);
};
const updateaccountDetailsInputValidation = (data: unknown) => {
  const schema = Joi.object({
    requestId: Joi.string().required(),
    bankName: Joi.string().required(),
    accountNumber: Joi.string().required(),
    accountName: Joi.string().required(),
    status: Joi.string().optional().allow(""),
  });
  return schema.validate(data);
};

const generateReceiptInputValidation = (data: unknown) => {
  const schema = Joi.object({
    requestId: Joi.string().required(),
  });
  return schema.validate(data);
};

export {
  validateSigninInput,
  sendOtpInputValidation,
  ValidateviewAllValidation,
  addusersInputValidation,
  updateusersInputValidation,
  validateMobileSigninInput,
  validateBankAccountVerifyinInput,
  ValidateViewBankAllValidation,
  validateUserLogoutinInput,
  addpinInputValidation,
  updatepinInputValidation,
  addotpInputValidation,
  updateotpInputValidation,
  validateOtpVerifyInput,
  resendOtpInputValidation,
  addmaintenanceInputValidation,
  updatemaintenanceInputValidation,
  addRentPaymentInputValidation,
  updateRentPaymentInputValidation,
  addTenancyPaymentInputValidation,
  addaccountDetailsInputValidation,
  updateaccountDetailsInputValidation,
  generateReceiptInputValidation,
};
