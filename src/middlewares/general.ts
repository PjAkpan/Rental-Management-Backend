import { getters, HttpStatusCode } from "../config";
import { createHttpError, errorHandler, responseObject } from "../utils";
import { RequestHandler } from "express";
import jwt from "jsonwebtoken";

export const general: RequestHandler = async (req, res, next) => {
  await Promise.resolve();
  let statusCode = 500;
  let message = "Fatal error occurred";

  let { token } = req.headers;
  const accessTokenIndex = req.rawHeaders.indexOf("ACCESS_TOKEN");
  try {
    // if (!token) {
    //   message = "Unable to find headers";
    //   statusCode = 400;
    //   throw new Error(message);
    // }
    if (
      accessTokenIndex !== -1 &&
      accessTokenIndex < req.rawHeaders.length - 1
    ) {
      const accessToken = req.rawHeaders[accessTokenIndex + 1];
      req.ACCESS_TOKEN = accessToken;
    }
    const isTokenEmpty =
      (!req.headers.authorization ||
        !req.headers.authorization.startsWith("Bearer ")) &&
      !req.ACCESS_TOKEN &&
      !(req.cookies && req.cookies.__session);

    if (isTokenEmpty) {
      statusCode = 401;
      throw createHttpError(
        "Unauthorized Access - No Token Provided!",
        statusCode
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

    let decodedData: unknown;

    jwt.verify(
      token as string,
      getters.getAppSecrets().accessTokenSecret,
      (err: unknown, decoded) => {
        if (err) {
          statusCode = 401;
          message = "Invalid token. Unauthorized entry not allowed";
          throw new Error(message);
        }

        decodedData = decoded;
      }
    );
    //  const cypherMessage = decodedData.resPon.payload;

    // const resPon = await costomencryDecryptInternalCRYPTOJS(
    //   "DE",
    //   cypherMessage,
    //   getAppDetails().appInSec,
    //   getAppDetails().appInV,
    // );
    // decodedData = resPon.payload;
    // logToConsole("decodedData",decodedData);
    req.ACCESS_TOKEN = token as string;
    req.currentTokenDetails = decodedData;

    next();
  } catch (err) {
    const errorResponse = errorHandler(
      err,
      null,
      message,
      "Login function error"
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
