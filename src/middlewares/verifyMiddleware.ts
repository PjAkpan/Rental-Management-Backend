import { NextFunction, RequestHandler, Response } from "express";
import { createHttpError, errorHandler, responseObject } from "../utils";
import { logger } from "netwrap";
import { Helpers } from "src/types/types";
import {
  sendOtpInputValidation,
  validateSigninInput,
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
} from "../utils/validate";
import { usersModel } from "../models";

const checkIfUserIsVerified: RequestHandler = async (req, res, next) => {
  let statusCode = 500;
  let message = "Fatal error occurred while verifying admin status";

  try {
    // Uncomment and implement when needed
    const checkUserProfileCompletion = await usersModel.findUsers({
      email: req.body.email,
      ProfileCompleted: "unCompleted",
    });

    if (checkUserProfileCompletion.status === false) {
      statusCode = 400;
      message = checkUserProfileCompletion.message;
      throw createHttpError(message, statusCode);
    }
    next();
  } catch (err) {
    logger(err, { shouldLog: true, isError: true });

    message = (err as Error).message;
    return responseObject({
      res,
      statusCode: statusCode,
      message: errorHandler(err as Error, null)?.message || message,
    });
  }
};

const createValidationMiddleware = (
  validationFn: (data: object) => {
    error?: { details: { message: string }[] };
  },
  target: Helpers.ValidationTarget = "body",
): RequestHandler => {
  return (req: Helpers.ExtendedRequest, res: Response, next: NextFunction) => {
    let statusCode = 500;
    let message = "Fatal error occurred";

    try {
      const dataToValidate =
        target === "body"
          ? req.body
          : target === "query"
            ? req.query
            : req.params;

      const { error } = validationFn(
        dataToValidate as { email: string; otp: string },
      );
      if (error) {
        statusCode = 400;
        message = error.details[0].message;
        throw createHttpError(message, statusCode);
      }
      next();
    } catch (err) {
      logger(err, { shouldLog: true, isError: true });

      return responseObject({
        res,
        statusCode,
        message:
          errorHandler(err as Error, null)?.message || (err as Error).message,
      });
    }
  };
};

const validateOtpRequestInput = createValidationMiddleware(
  sendOtpInputValidation,
);
const validateLoginInput = createValidationMiddleware(validateSigninInput);

const validateVeiwAllInput = createValidationMiddleware(
  ValidateviewAllValidation,
  "query",
);

const validateCreateUsersRequest = createValidationMiddleware(
  addusersInputValidation,
  "body",
);

const updateUsersInputRequest = createValidationMiddleware(
  updateusersInputValidation,
  "body",
);

const validateLoginUsersRequest = createValidationMiddleware(
  validateSigninInput,
  "body",
);

const validateMobileLoginUsersRequest = createValidationMiddleware(
  validateMobileSigninInput,
  "body",
);

const validateUserAccountRequest = createValidationMiddleware(
  validateBankAccountVerifyinInput,
  "body",
);

const validateViewBankstRequest = createValidationMiddleware(
  ValidateViewBankAllValidation,
  "params",
);

const validateLogoutUsersRequest = createValidationMiddleware(
  validateUserLogoutinInput,
  "body",
);

const validateCreatePinRequest = createValidationMiddleware(
  addpinInputValidation,
  "body",
);

const updatePinInputRequest = createValidationMiddleware(
  updatepinInputValidation,
  "body",
);

const validateCreateOtpRequest = createValidationMiddleware(
  addotpInputValidation,
  "body",
);

const validateVerifyOtpRequest = createValidationMiddleware(
  validateOtpVerifyInput,
  "body",
);

const updateOtpInputRequest = createValidationMiddleware(
  updateotpInputValidation,
  "body",
);

const validateResendOtpRequest = createValidationMiddleware(
  resendOtpInputValidation,
  "body",
);

const validateCreateMaintenanceRequest = createValidationMiddleware(
  addmaintenanceInputValidation,
  "body",
);

const updateMaintenanceInputRequest = createValidationMiddleware(
  updatemaintenanceInputValidation,
  "body",
);

const validateCreateRentPaymentRequest = createValidationMiddleware(
  addRentPaymentInputValidation,
  "body",
);

const updateRentPaymentInputRequest = createValidationMiddleware(
  updateRentPaymentInputValidation,
  "body",
);

const validateCreateTenancyPaymentRequest = createValidationMiddleware(
  addTenancyPaymentInputValidation,
  "body",
);
const verifyMiddleware = {
  checkIfUserIsVerified,
  validateLoginInput,
  validateOtpRequestInput,
  validateVeiwAllInput,
  validateCreateUsersRequest,
  updateUsersInputRequest,
  validateLoginUsersRequest,
  validateMobileLoginUsersRequest,
  validateUserAccountRequest,
  validateViewBankstRequest,
  validateLogoutUsersRequest,
  validateCreatePinRequest,
  updatePinInputRequest,
  validateCreateOtpRequest,
  validateVerifyOtpRequest,
  validateResendOtpRequest,
  updateOtpInputRequest,
  validateCreateMaintenanceRequest,
  updateMaintenanceInputRequest,
  validateCreateRentPaymentRequest,
  updateRentPaymentInputRequest,
  validateCreateTenancyPaymentRequest,
};

export { verifyMiddleware };
