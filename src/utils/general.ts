/* eslint-disable @typescript-eslint/no-explicit-any */
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { createHttpError } from "./createHttpError";
import { getters, HttpStatusCode } from "@config";
import { errorHandler, responseObject } from "../utils";
import { logger } from "netwrap";

export const general: RequestHandler = async (req, res, next) => {
  await Promise.resolve();
  let statusCode = HttpStatusCode.InternalServerError;
  let payload = null;
  let message = `A critical error occured. Kindly contact 
  admin for details about a possible solution to this error`;

  let { token } = req.headers;
  const accessTokenIndex = req.rawHeaders.indexOf("ACCESS_TOKEN");
  try {
    // if (!token) {
    //   message = "Unable to find headers";
    //   statusCode = 400;
    //   throw new Error(message);
    // }
    if (accessTokenIndex !== -1 && accessTokenIndex < req.rawHeaders.length - 1) {
      const accessToken = req.rawHeaders[accessTokenIndex + 1];
      req.ACCESS_TOKEN = accessToken;
    }
    const isTokenEmpty =
    (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) &&
    !req.ACCESS_TOKEN &&
    !(req.cookies && req.cookies.__session);

    if (isTokenEmpty) {
      statusCode = HttpStatusCode.Unauthorized;
      throw createHttpError(
        "Unauthorized Access - No Token Provided!",
        statusCode,
      );
    }
    if (req.headers.authorization?.startsWith("Bearer ")) {
      // Read the ID Token from the Authorization header.
      token = req.headers.authorization.split("Bearer ")[1];
    } else if (req.ACCESS_TOKEN) {
      // Read the ID Token from cookie.
      token = req.ACCESS_TOKEN;
    } else if (req.cookies) {
      // Read the ID Token from cookie.
      token = req.cookies.__session;
    } else {
      token = req.headers["x-authorization"] || "";
    }


    let decodedData: any;

    jwt.verify(
      token as string,
      getters.getAppSecrets().accessTokenSecret,
      (err: any, decoded) => {
        logger(err);
        if (err) {
          statusCode = 401;
          message = "Invalid token. Unauthorized entry not allowed";
          throw new Error(message);
        }

        decodedData = decoded;
      },
    );

    // const cypherMessage = decodedData.resPon.payload;

    // const resPon = await costomencryDecryptInternalCRYPTOJS("DE", cypherMessage,  getters.getAppSecrets().appInSec,
    //   getters.getAppSecrets().appInV,);
    // decodedData =resPon.payload.payload;
    logger(decodedData);
    req.ACCESS_TOKEN = token as string;
    req.currentTokenDetails = decodedData;
    req.USER_ROLES =decodedData.UserType;

    next();
  } catch (err) {
    logger(err);

    const errorResponse = errorHandler(
      err,
      null,
      message,
      "commerceBankLogin -- oauth/token function error",
    );
    payload = errorResponse.payload;
    return responseObject({
      res,
      statusCode:
        errorResponse.statusCode || HttpStatusCode.InternalServerError,
      message: errorResponse.message,
      payload,
    });
  }
};
