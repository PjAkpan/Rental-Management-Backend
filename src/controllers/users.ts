import { HttpStatusCode, getters } from "../config";
import {
  addIfNotEmpty,
  costomencryDecryptInternalCRYPTOJS,
  createHttpError,
  errorHandler,
  responseObject,
} from "../utils";
import type { RequestHandler } from "express";
import { usersModel } from "../models";
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { logger } from "netwrap";
import requestIp from "request-ip";
import { sendOtp } from "./otp";

const checkServiceHealth: RequestHandler = (_req, res) => {
  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const addUsers: RequestHandler = async (req, res) => {
  const {
    password,
    email,
    fullName,
    phoneNumber,
    deviceId,
    roomNumber = null,
    profileImage,
  } = req.body;

  let ipAddress = req.body.ipAddress || requestIp.getClientIp(req);
  let role: string | string[] = [];
  console.log("Detected IP Address:", ipAddress);
  try {
    const filter = {
      where: {
        email: { [Op.like]: `%${email}%` },
        phoneNumber: { [Op.like]: `%${phoneNumber}%` },
      },
    };
    const check = await usersModel.findUsers(filter);

    if (check.status) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.Conflict,
        message: check.message,
        payload: check.payload,
      });
    }

    if (!Array.isArray(role)) {
      role = [role];
    }
    const defaultRoles = ["customer"];
    const mergedRoles = Array.from(new Set([...defaultRoles, ...role]));
    role = mergedRoles.join(",");

    const createUsers = await usersModel.saveUsers({
      password: bcrypt.hashSync(password, 8),
      email,
      fullName,
      phoneNumber,
      deviceId,
      roomNumber,
      profileImage,
      role,
      ipAddress: Array.isArray(ipAddress) ? ipAddress : [ipAddress],
      isVerified: false,
      homeAddress: null,
      occupation: null,
      isDeleted: false,
      isActive: false,
      activeSession: null,
    });
    console.log("*******",createUsers);
    if (!createUsers.payload) {
      throw new Error("User creation failed: Payload is null");
    }

    sendOtp({
      userId: createUsers.payload?.id,
      email,
      deviceId,
    });

    return responseObject({
      res,
      statusCode: createUsers.statusCode,
      message:
        createUsers.message +
        " kindly visit your email box to access otp code for account validation",
      payload: createUsers.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const deleteUsers: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await usersModel.findUsersById(id);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }

    const deleteUsers = await usersModel.deleteUsersById(id);
    return responseObject({
      res,
      statusCode: deleteUsers.statusCode,
      message: deleteUsers.message,
      payload: deleteUsers.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const modifyUsers: RequestHandler = async (req, res) => {
  const payload = {};
  const {
    status,
    userId,
    email,
    fullName,
    phoneNumber,
    deviceId,
    fcmToken,
    profileImage,
    bvn,
    nin,
    homeAddress,
    occupation,
  } = req.body;
  try {
    const filter = { where: { id: userId } };
    const check = await usersModel.findUsers(filter);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }
    addIfNotEmpty(payload, "fullName", fullName);
    addIfNotEmpty(payload, "email", email);
    addIfNotEmpty(payload, "phoneNumber", phoneNumber);
    addIfNotEmpty(payload, "deviceId", deviceId);
    addIfNotEmpty(payload, "profileImage", profileImage);
    addIfNotEmpty(payload, "fcmToken", fcmToken);
    addIfNotEmpty(payload, "occupation", occupation);
    addIfNotEmpty(payload, "bvn", bvn);
    addIfNotEmpty(payload, "nin", nin);
    addIfNotEmpty(payload, "homeAddress", homeAddress);
    addIfNotEmpty(payload, "isActive", status);
    const updatedUsers = await usersModel.updateUsersById(userId, payload);
    if (updatedUsers.payload) {
      delete updatedUsers.payload.profileImage;
      delete updatedUsers.payload.pin;
      // console.log("After deletion:", createPin);
    }
    return responseObject({
      res,
      statusCode: updatedUsers.statusCode,
      message: updatedUsers.message,
      payload: updatedUsers.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const fetchSingleInfo: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await usersModel.findUsersById(id);
    return responseObject({
      res,
      statusCode: check.statusCode,
      message: check.message,
      payload: check.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const fetchAllUserss: RequestHandler = async (req, res) => {
  const { orderBy = "createdAt", sort = "DESC", size, page } = req.query;
  try {
    const sizeNumber = parseInt(size as string) || 10;
    const pageNumber = parseInt(page as string) || 1;
    const filter = {
      order: [[orderBy, sort]],
      limit: sizeNumber,
      offset: sizeNumber * (pageNumber - 1),
    };
    const response = await usersModel.findAll(filter);

    if (!response.status) {
      return responseObject({
        res,
        statusCode: response.statusCode,
        message: response.message,
        payload: response.payload,
      });
    }

    const totalRecords = response.payload?.recordCount || 0;
    const totalPages = Math.ceil(totalRecords / sizeNumber);
    const payload = {
      currentPage: pageNumber,
      totalRecords,
      totalPages,
      data: response.payload?.allRecords,
    };
    return responseObject({
      res,
      statusCode: HttpStatusCode.OK,
      message: "Successfully fetched all records",
      payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const loginUsers: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = `A critical error occured. Kindly contact admin
   for details about a possible solution to this error`;
  let payload = {};
  const { password, email, deviceId } = req.body;

  try {
    const filter = {
      where: {
        email: email,
      },
    };
    const loginUserService = await usersModel.findUsers(filter);
    // logger(loginUserService.payload, { shouldLog: true, isError: true });
    if (loginUserService.status == false) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.Conflict,
        message: loginUserService.message,
        payload: loginUserService.payload,
      });
    }

    // Check if payload is null
    if (loginUserService.payload === null) {
      throw createHttpError("User not found", HttpStatusCode.NotFound);
    }

    const checkPassword = bcrypt.compare(
      password,
      loginUserService.payload.password,
    );
    if (!checkPassword) {
      throw createHttpError("Invalid login details", HttpStatusCode.NotFound);
    }

    if (loginUserService.payload.isActive == false) {
      throw createHttpError("Account not active", HttpStatusCode.Forbidden);
    }
    // Handle single-session logic
    const activeSession = loginUserService.payload.activeSession?.[0];
    if (activeSession && activeSession.deviceId !== deviceId) {
      // Verify if the token in the active session is still valid
      jwt.verify(
        activeSession.token,
        getters.getAppSecrets().accessTokenSecret,
        (err: unknown) => {
          if (err) {
            logger(
              // eslint-disable-next-line max-len
              "Previous session token is invalid or expired. Proceeding with login.",
            );
          } else {
            throw createHttpError(
              // eslint-disable-next-line max-len
              "You are already logged in on another device. Please log out from that device first.",
              HttpStatusCode.Forbidden,
            );
          }
        },
      );
    } else {
      logger(
        // eslint-disable-next-line max-len
        "Previous session token is invalid or expired. Proceeding with login.",
      );
    }

    const payload2Result = {
      UserId: loginUserService.payload.id,
      fullName: loginUserService.payload.fullName,
      roomNumber: loginUserService.payload.roomNumber,
      email: loginUserService.payload.email,
      access: loginUserService.payload.role,
      isVerified: loginUserService.payload.isVerified,
      status: loginUserService.payload.status,
    };
    const cypherMessage = JSON.stringify(payload2Result);
    const resPon = await costomencryDecryptInternalCRYPTOJS(
      "EN",
      cypherMessage,
      getters.getAppSecrets().appInSec,
      getters.getAppSecrets().appInV,
    );
    const payloadResult = {
      UserId: loginUserService.payload.id,
      email: loginUserService.payload.email,
      isActive: loginUserService.payload.isActive,
      encryptedData: resPon,
    };
    const payloadToken = {
      payloadResult,
      message: "waytin u keep here way u they find ! 😈😂",
    };
    const verificationToken = jwt.sign(
      payloadToken,
      getters.getAppSecrets().accessTokenSecret,
      {
        expiresIn: getters.getAppSecrets().expireTime,
      },
    );
    const updateData = [
      {
        token: verificationToken, // Store JWT or session token here
        deviceId: deviceId, // Track which device is being used
        loginTime: new Date(), // Track the login time
      },
    ];
    const extraDat = {
      userID: payloadResult.UserId,
      profileImage: loginUserService.payload.profileImage,
    };
    await usersModel.updateUsersById(loginUserService.payload.id, {
      activeSession: updateData,
    });
    statusCode = HttpStatusCode.OK;
    message = "Login successful";
    payload = { encryptedString: resPon.payload, verificationToken, extraDat };

    return responseObject({
      res,
      statusCode,
      message,
      payload,
    });
  } catch (err) {
    const errorResponse = errorHandler(
      err,
      null,
      message,
      "Login function error",
    );

    return responseObject({
      res,
      statusCode:
        errorResponse.statusCode || HttpStatusCode.InternalServerError,
      message: errorResponse.message,
      payload: errorResponse.payload,
    });
  }
};

const mobileLoginUsers: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = `A critical error occured. Kindly contact admin
   for details about a possible solution to this error`;
  let payload = {};
  const { deviceId, password } = req.body;

  try {
    const filter = {
      where: {
        deviceId: deviceId,
      },
    };
    const loginUserService = await usersModel.findUsers(filter);
    logger(loginUserService.payload, { shouldLog: true, isError: true });

    // Check if payload is null
    if (loginUserService.payload === null) {
      throw createHttpError("User not found", HttpStatusCode.NotFound);
    }

    if (loginUserService.payload.isActive == false) {
      throw createHttpError("Account not active", HttpStatusCode.Forbidden);
    }

    const checkPassword = bcrypt.compare(
      password,
      loginUserService.payload.password,
    );
    if (!checkPassword) {
      throw createHttpError("Invalid login details", HttpStatusCode.NotFound);
    }
    // Handle single-session logic
    const activeSession = loginUserService.payload.activeSession?.[0];
    if (activeSession && activeSession.deviceId !== deviceId) {
      // Verify if the token in the active session is still valid
      jwt.verify(
        activeSession.token,
        getters.getAppSecrets().accessTokenSecret,
        (err: unknown) => {
          if (err) {
            logger(
              // eslint-disable-next-line max-len
              "Previous session token is invalid or expired. Proceeding with login.",
            );
          } else {
            throw createHttpError(
              // eslint-disable-next-line max-len
              "You are already logged in on another device. Please log out from that device first.",
              HttpStatusCode.Forbidden,
            );
          }
        },
      );
    } else {
      logger(
        // eslint-disable-next-line max-len
        "Previous session token is invalid or expired. Proceeding with login.",
      );
    }

    const payload2Result = {
      UserId: loginUserService.payload.id,
      fullName: loginUserService.payload.fullName,
      roomNumber: loginUserService.payload.roomNumber,
      email: loginUserService.payload.email,
      access: loginUserService.payload.role,
      isVerified: loginUserService.payload.isVerified,
      status: loginUserService.payload.status,
    };
    const cypherMessage = JSON.stringify(payload2Result);
    const resPon = await costomencryDecryptInternalCRYPTOJS(
      "EN",
      cypherMessage,
      getters.getAppSecrets().appInSec,
      getters.getAppSecrets().appInV,
    );
    const payloadResult = {
      UserId: loginUserService.payload.id,
      email: loginUserService.payload.email,
      isActive: loginUserService.payload.isActive,
      encryptedData: resPon,
    };

    const payloadToken = {
      payloadResult,
      message: "waytin u keep here way u they find ! 😈😂",
    };
    const verificationToken = jwt.sign(
      payloadToken,
      getters.getAppSecrets().accessTokenSecret,
      {
        expiresIn: getters.getAppSecrets().expireTime,
      },
    );
    const updateData = [
      {
        token: verificationToken, // Store JWT or session token here
        deviceId: deviceId, // Track which device is being used
        loginTime: new Date(), // Track the login time
      },
    ];
    const extraDat = {
      userID: payloadResult.UserId,
      profileImage: loginUserService.payload.profileImage,
    };
    await usersModel.updateUsersById(loginUserService.payload.id, {
      activeSession: updateData,
    });
    statusCode = HttpStatusCode.OK;
    message = "Login successful";
    payload = { encryptedString: resPon.payload, verificationToken, extraDat };

    return responseObject({
      res,
      statusCode,
      message,
      payload,
    });
  } catch (err) {
    const errorResponse = errorHandler(
      err,
      null,
      message,
      "Login function error",
    );

    return responseObject({
      res,
      statusCode:
        errorResponse.statusCode || HttpStatusCode.InternalServerError,
      message: errorResponse.message,
      payload: errorResponse.payload,
    });
  }
};

const logoutAllDevices: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = "A critical error occurred. Please try again.";
  const { userId } = req.body;
  try {
    const filter = {
      where: {
        id: userId,
      },
    };
    const checkUser = await usersModel.findUsers(filter);
    if (!checkUser) {
      throw createHttpError("User not found", HttpStatusCode.NotFound);
    }

    // Clear all active sessions for this user
    await usersModel.updateUsersById(userId, { activeSession: [] });

    statusCode = HttpStatusCode.OK;
    message = "All sessions successfully logged out";

    return responseObject({
      res,
      statusCode,
      message,
    });
  } catch (err) {
    const errorResponse = errorHandler(
      err,
      null,
      message,
      "Logout All Devices Error",
    );

    return responseObject({
      res,
      statusCode:
        errorResponse.statusCode || HttpStatusCode.InternalServerError,
      message: errorResponse.message,
      payload: errorResponse.payload,
    });
  }
};

export {
  loginUsers,
  checkServiceHealth,
  addUsers,
  modifyUsers,
  deleteUsers,
  fetchSingleInfo,
  fetchAllUserss,
  mobileLoginUsers,
  logoutAllDevices,
};
