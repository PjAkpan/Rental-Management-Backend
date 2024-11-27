/* eslint-disable @typescript-eslint/no-unused-vars */
import { HttpStatusCode, getters } from "../config";
import {
  createHttpError,
  CustomWinstonLogger,
  errorHandler,
  responseObject,
  uuidHelper,
} from "../utils";
import type { RequestHandler } from "express";
import { otpModel as importedOtpModel, usersModel as importedUsersModel } from "../models";
import { Op } from "sequelize";
import { logger } from "netwrap";
import { sendVerifyOtp } from "../templates/mailers";

// Corrected type definitions
type OtpRecord = {
  id: string;
  otpNumber: string;
  otpTime: Date;
  isActive: boolean;
  initiatorId: string;
  deviceId: string;
  referenceId: string;
};

type UserRecord = {
  id: string;
  email: string;
  status: boolean;
}

type UsersModel = {
  findUsers(filter: any): Promise<{ status: boolean; payload?: UserRecord | null; message: string; statusCode: number }>;
  findUserByEmail(email: string): Promise<UserRecord | null>;
};

type OtpModel = {
  findOtpByReferenceId(referenceId: string): Promise<OtpRecord | null>;
  updateOtpById(id: string, updateData: Partial<OtpRecord>): Promise<void>;
  saveOtp(data: Partial<OtpRecord>): Promise<{ status: boolean; payload?: any; message: string; statusCode: number }>;
  deleteMultipleRows(filter: any): Promise<void>;
};

// Example implementations for models (replace with actual implementation)
const otpModel: OtpModel = {
  findOtpByReferenceId: async (referenceId: string) => null,
  updateOtpById: async (id: string, updateData: Partial<OtpRecord>) => undefined,
  saveOtp: async (data: Partial<OtpRecord>) => ({
    status: true,
    message: "OTP saved successfully.",
    statusCode: HttpStatusCode.OK,
  }),
  deleteMultipleRows: async (filter: any) => undefined,
};

const usersModel: UsersModel = {
  findUsers: async (filter: any) => ({
    status: true,
    payload: { id: "123", email: "test@example.com", status: true },
    message: "User found.",
    statusCode: HttpStatusCode.OK,
  }),
  findUserByEmail: async (email: string) => ({
    id: "123",
    email: "test@example.com",
    status: true,
  }),
};

const checkServiceHealth: RequestHandler = (_req, res) => {
  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const addOtp: RequestHandler = async (req, res) => {
  const { initiatorId, email, deviceId } = req.body;
  const currentDate = new Date();
  const fiveMinutesLater = new Date(currentDate.getTime() + 5 * 60000);
  try {
    const filterUser = {
      where: {
        [Op.or]: [
          { id: initiatorId },
          { email: email },
          { deviceId: deviceId },
        ],
      },
    };
    const checkUser = await usersModel.findUsers(filterUser);

    if (!checkUser.status) {
      return responseObject({
        res,
        statusCode: checkUser.statusCode,
        message: checkUser.message,
        payload: checkUser.payload,
      });
    }
    const filter = {
      where: {
        [Op.or]: [{ initiatorId: initiatorId }, { deviceId: deviceId }],
      },
    };
    await otpModel.deleteMultipleRows(filter);

    const referenceId = uuidHelper.generate();

    const otpNumber = (Math.floor(Math.random() * 900000) + 100000).toString();
    const createOtp = await otpModel.saveOtp({
      otpNumber: otpNumber,
      referenceId,
      initiatorId,
      deviceId,
      isActive: true,
      otpTime: fiveMinutesLater,
    });
    if (!createOtp) {
      throw createHttpError(
        "Unable to create otp at this time",
        HttpStatusCode.UnprocessableEntity,
      );
    }

    const mailSent = await sendVerifyOtp({
      email: checkUser.payload!.email,
      otpNumber,
    });
    logger(mailSent);
    return responseObject({
      res,
      statusCode: createOtp.statusCode,
      message: createOtp.message,
      payload: createOtp.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const sendOtp = async (requestData: {
  userId?: string;
  email?: string;
  deviceId?: string;
}) => {
  let statusCode = 503;
  let saveAccount: any = null;
  let message =
    "A critical error occurred. Kindly contact admin for details about a possible solution to this error";
  let payload = null;
  let success = false;
  const otpNumber = (Math.floor(Math.random() * 900000) + 100000).toString();
  const referenceId = uuidHelper.generate();
  const currentDate = new Date();
  const fiveMinutesLater = new Date(currentDate.getTime() + 5 * 60000);
  try {
    const filterUser = {
      where: {
        [Op.or]: [
          { id: requestData.userId },
          { email: requestData.email },
          { deviceId: requestData.deviceId },
        ],
      },
    };

    const checkUser = await usersModel.findUsers(filterUser);

    if (checkUser && checkUser.status === true && checkUser.payload) {
      const UserInfo = checkUser.payload; // TypeScript now knows UserInfo is not null

      saveAccount = await otpModel.saveOtp({
        initiatorId: requestData.userId,
        referenceId,
        otpNumber,
        deviceId: requestData.deviceId,
        isActive: true,
        otpTime: fiveMinutesLater,
      });

      statusCode =
        saveAccount.status === true
          ? HttpStatusCode.OK
          : HttpStatusCode.NotFound;
      message =
        saveAccount.status === true ? "Otp request sent" : saveAccount.message;
      payload = saveAccount.status === true ? saveAccount.payload : [];
      success = saveAccount.status === true;

      // Safely access UserInfo.email
      const mailSent = await sendVerifyOtp({
        email: UserInfo.email ?? requestData.email,
        otpNumber: otpNumber,
      });
      logger(mailSent, { shouldLog: true, isError: false });
    } else {
      // Handle the case where checkUser.status is false or checkUser.payload is null
      statusCode = HttpStatusCode.NotFound;
      message = "User not found";
      payload = [];
      success = false;
    }

    return { statusCode, message, payload, success };
  } catch (error) {
    logger(error, { shouldLog: true, isError: true });
    payload = (error as any).response?.data;
    statusCode =
      (error as any).response?.data.responseCode ||
      (error as any).response?.status ||
      503;
    message =
      errorHandler(error, null).message ||
      (error as any).response.data.responseMessage;
    success = false;

    CustomWinstonLogger(
      "error",
      { payload, statusCode, message, error },
      "send user otp Request",
    );

    return { statusCode, message, payload, success, error };
  }
};

const verifyOtp: RequestHandler = async (req, res) => {
  const { otpNumber, referenceId, email } = req.body;
  
  try {
    if (!otpNumber || !referenceId || !email) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.BadRequest,
        message: "OTP number, reference ID, and email are required.",
      });
    }
    const otpRecord = await otpModel.findOtpByReferenceId(referenceId);

    if (!otpRecord || otpRecord.otpNumber !== otpNumber) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.Unauthorized,
        message: "Invalid OTP number.",
      });
    }

    if (new Date() > otpRecord.otpTime) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.Unauthorized,
        message: "OTP has expired.",
      });
    }

    // Mark OTP as used (deactivate it)
    await otpModel.updateOtpById(otpRecord.id, { isActive: false });

    // Optionally, send a success message or email
    const user = await usersModel.findUserByEmail(email);
    if (!user || !user.status) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.NotFound,
        message: "User not found.",
      });
    }
    return responseObject({
      res,
      statusCode: HttpStatusCode.OK,
      message: "OTP verified successfully.",
    });

  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const resendOtp: RequestHandler = async (req, res) => {
  const { email, initiatorId, deviceId } = req.body;

  try {
    // Step 1: Check if the user exists
    const filterUser = {
      where: {
        [Op.or]: [{ email: email }, { id: initiatorId }, { deviceId: deviceId }],
      },
    };
    const checkUser = await usersModel.findUsers(filterUser);

    if (!checkUser.status || !checkUser.payload) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.NotFound,
        message: "User not found.",
      });
    }

    // Step 2: Check if an active OTP exists for this user
    const otpRecord = await otpModel.findOtpByReferenceId(email); // Or use another identifier

    if (otpRecord && otpRecord.isActive && new Date() < otpRecord.otpTime) {
      // OTP is still valid and active, resend the OTP
      const mailSent = await sendVerifyOtp({
        email: checkUser.payload.email,
        otpNumber: otpRecord.otpNumber,
      });

      logger(mailSent);
      return responseObject({
        res,
        statusCode: HttpStatusCode.OK,
        message: "OTP resent successfully.",
      });
    } else {
      // OTP expired or not active, generate a new OTP
      const otpNumber = (Math.floor(Math.random() * 900000) + 100000).toString();
      const referenceId = uuidHelper.generate();
      const currentDate = new Date();
      const fiveMinutesLater = new Date(currentDate.getTime() + 5 * 60000);

      // Delete previous OTP records for this user/device
      await otpModel.deleteMultipleRows({
        where: { [Op.or]: [{ email: email }, { initiatorId: initiatorId }] },
      });

      // Create new OTP
      const createOtp = await otpModel.saveOtp({
        otpNumber,
        referenceId,
        initiatorId,
        deviceId,
        isActive: true,
        otpTime: fiveMinutesLater,
      });

      if (!createOtp) {
        throw createHttpError("Unable to create OTP", HttpStatusCode.UnprocessableEntity);
      }

      // Send new OTP
      const mailSent = await sendVerifyOtp({
        email: checkUser.payload.email,
        otpNumber,
      });

      logger(mailSent);

      return responseObject({
        res,
        statusCode: HttpStatusCode.OK,
        message: "New OTP generated and sent.",
      });
    }
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};




// const deleteOtp: RequestHandler = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const check = await otpModel.findOtpById(id);

//     if (!check.status) {
//       return responseObject({
//         res,
//         statusCode: check.statusCode,
//         message: check.message,
//         payload: check.payload,
//       });
//     }

//     const deleteOtp = await otpModel.deleteOtpById(id);
//     return responseObject({
//       res,
//       statusCode: deleteOtp.statusCode,
//       message: deleteOtp.message,
//       payload: deleteOtp.payload,
//     });
//   } catch (err) {
//     return responseObject({
//       res,
//       statusCode: HttpStatusCode.InternalServerError,
//       message: errorHandler(err, null).message,
//     });
//   }
// };

// const modifyOtp: RequestHandler = async (req, res) => {
//   const { status, OtpId, OtpName } = req.body;
//   try {
//     const filter = { where: { id: OtpId } };
//     const check = await otpModel.findOtp(filter);

//     if (!check.status) {
//       return responseObject({
//         res,
//         statusCode: check.statusCode,
//         message: check.message,
//         payload: check.payload,
//       });
//     }

//     const updatedOtp = await otpModel.updateOtpById(OtpId, {
//       name: OtpName,
//       isActive: status,
//     });
//     return responseObject({
//       res,
//       statusCode: updatedOtp.statusCode,
//       message: updatedOtp.message,
//       payload: updatedOtp.payload,
//     });
//   } catch (err) {
//     return responseObject({
//       res,
//       statusCode: HttpStatusCode.InternalServerError,
//       message: errorHandler(err, null).message,
//     });
//   }
// };

// const fetchSingleInfo: RequestHandler = async (req, res) => {
//   const { id } = req.params;
//   try {
//     const check = await otpModel.findOtpById(id);
//     return responseObject({
//       res,
//       statusCode: check.statusCode,
//       message: check.message,
//       payload: check.payload,
//     });
//   } catch (err) {
//     return responseObject({
//       res,
//       statusCode: HttpStatusCode.InternalServerError,
//       message: errorHandler(err, null).message,
//     });
//   }
// };

// const fetchAllOtps: RequestHandler = async (req, res) => {
//   const { orderBy = "createdAt", sort = "DESC", size, page } = req.query;
//   try {
//     const sizeNumber = parseInt(size as string) || 10;
//     const pageNumber = parseInt(page as string) || 1;
//     const filter = {
//       order: [[orderBy, sort]],
//       limit: sizeNumber,
//       offset: sizeNumber * (pageNumber - 1),
//     };
//     const response = await otpModel.findAll(filter);

//     if (!response.status) {
//       return responseObject({
//         res,
//         statusCode: response.statusCode,
//         message: response.message,
//         payload: response.payload,
//       });
//     }

//     const totalRecords = response.payload?.recordCount || 0;
//     const totalPages = Math.ceil(totalRecords / sizeNumber);
//     const payload = {
//       currentPage: pageNumber,
//       totalRecords,
//       totalPages,
//       data: response.payload?.allRecords,
//     };
//     return responseObject({
//       res,
//       statusCode: HttpStatusCode.OK,
//       message: "Successfully fetched all records",
//       payload,
//     });
//   } catch (err) {
//     return responseObject({
//       res,
//       statusCode: HttpStatusCode.InternalServerError,
//       message: errorHandler(err, null).message,
//     });
//   }
// };

export {
  checkServiceHealth,
  addOtp,
  sendOtp,
  verifyOtp,
  resendOtp,
  // modifyOtp,
  // deleteOtp,
  // fetchSingleInfo,
  // fetchAllOtps,
};
