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
import { Op } from "sequelize";
import { logger } from "netwrap";
import { sendVerifyOtp } from "../templates/mailers";
import { otpModel, usersModel } from "../models";

// // Corrected type definitions
// type OtpRecord = {
//   id: string;
//   otpNumber: string;
//   otpTime: Date;
//   isActive: boolean;
//   initiatorId: string;
//   deviceId: string;
//   referenceId: string;
// };

// type UserRecord = {
//   id: string;
//   email: string;
//   status: boolean;
// }

// type UsersModel = {
//   findUsers(filter: any): Promise<{ status: boolean; payload?: UserRecord | null; message: string; statusCode: number }>;
//   findUserByEmail(email: string): Promise<UserRecord | null>;
// };

// type OtpModel = {
//   findOtpByReferenceId(referenceId: string): Promise<OtpRecord | null>;
//   updateOtpById(id: string, updateData: Partial<OtpRecord>): Promise<void>;
//   saveOtp(data: Partial<OtpRecord>): Promise<{ status: boolean; payload?: any; message: string; statusCode: number }>;
//   deleteMultipleRows(filter: any): Promise<void>;
// };

// // Example implementations for models (replace with actual implementation)
// const otpModel: OtpModel = {
//   findOtpByReferenceId: async (referenceId: string) => null,
//   updateOtpById: async (id: string, updateData: Partial<OtpRecord>) => undefined,
//   saveOtp: async (data: Partial<OtpRecord>) => ({
//     status: true,
//     message: "OTP saved successfully.",
//     statusCode: HttpStatusCode.OK,
//   }),
//   deleteMultipleRows: async (filter: any) => undefined,
// };

// const usersModel: UsersModel = {
//   findUsers: async (filter: any) => ({
//     status: true,
//     payload: { id: "123", email: "test@example.com", status: true },
//     message: "User found.",
//     statusCode: HttpStatusCode.OK,
//   }),
//   findUserByEmail: async (email: string) => ({
//     id: "123",
//     email: "test@example.com",
//     status: true,
//   }),
// };

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
  const { otp, referenceId } = req.body;

  try {
    // Fetch OTP and user records in parallel
    const [otpRecord] = await Promise.all([
      otpModel.findOtp({ where: { referenceId, otpNumber: otp } }),
    ]);

    const { payload: otpPayload } = otpRecord;
    if (!otpPayload || otpPayload.otpNumber !== otp) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.Unauthorized,
        message: "Invalid OTP number.",
      });
    }
    logger(otpPayload);
    if (new Date() > new Date(otpPayload.otpTime)) {
      // If OTP has expired
      return responseObject({
        res,
        statusCode: HttpStatusCode.Unauthorized,
        message: "OTP has expired.",
      });
    }

    if (!otpPayload.isActive) {
      // If OTP is not active
      return responseObject({
        res,
        statusCode: HttpStatusCode.Unauthorized,
        message: "OTP is no longer active.",
      });
    }

    // Mark OTP as used (deactivate it)
    await Promise.all([
      otpModel.updateOtpById(otpPayload.id, { isActive: false }),
      usersModel.updateUsersById(otpPayload.initiatorId, {
        isVerified: true,
        isActive: true,
      }),
    ]);

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
  const { email, deviceId } = req.body;

  try {
    const filterUser = {
      where: {
        [Op.or]: [{ email: email }, { deviceId: deviceId }],
      },
    };

    // Create a separate filter for the OTP query
    const filterOtp = {
      where: {
        deviceId: deviceId, // Only include deviceId for the OTP query
      },
    };

    const [checkUser, otpRecord] = await Promise.all([
      usersModel.findUsers(filterUser),
      otpModel.findOtp(filterOtp),
    ]);
    console.log({ checkUser, otpRecord });

    if (!checkUser.status || !checkUser.payload) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.NotFound,
        message: "User not found.",
      });
    }

    const { payload: userPayload } = checkUser;
    const { payload: otpPayload } = otpRecord;

    if (otpRecord && otpPayload?.isActive && new Date() < otpPayload.otpTime) {
      // Resend active OTP
      const mailSent = await sendVerifyOtp({
        email: userPayload.email,
        otpNumber: otpPayload.otpNumber,
      });
      logger(mailSent);

      return responseObject({
        res,
        statusCode: HttpStatusCode.OK,
        message: "OTP resent successfully.",
        payload: { referenceId: otpPayload.referenceId },
      });
    }

    // Step 3: Generate a new OTP
    const currentDate = new Date();
    const fiveMinutesLater = new Date(currentDate.getTime() + 5 * 60000);
    const otpNumber = (Math.floor(Math.random() * 900000) + 100000).toString();
    const referenceId = uuidHelper.generate();

    // // Perform delete and create operations in parallel
    // await Promise.all([
    //   otpModel.deleteOtpById(otpPayload.id),
    //   otpModel.saveOtp({
    //     otpNumber,
    //     referenceId,
    //     initiatorId: userPayload.id,
    //     deviceId,
    //     isActive: true,
    //     otpTime: fiveMinutesLater,
    //   }),
    // ]);
    await otpModel.createOrUpdate({
      otpNumber,
      referenceId,
      initiatorId: userPayload.id,
      deviceId,
      isActive: true,
      otpTime: fiveMinutesLater,
    });

    // Send new OTP
    const mailSent = sendVerifyOtp({
      email: userPayload.email,
      otpNumber,
    });
    logger(mailSent);

    return responseObject({
      res,
      statusCode: HttpStatusCode.OK,
      message: "New OTP generated and sent.",
      payload: { referenceId },
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

export { checkServiceHealth, addOtp, sendOtp, verifyOtp, resendOtp };
