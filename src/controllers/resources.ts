/* eslint-disable camelcase */
import { HttpStatusCode, getters } from "../config";
import { createFetcher, errorHandler, responseObject } from "../utils";
import type { RequestHandler } from "express";
import { logger } from "netwrap";

const checkServiceHealth: RequestHandler = (...rest) => {
  const res = rest[1];

  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const verifyBankAccount: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = `A critical error occurred. Kindly contact
   admin for details about a possible solution to this error.`;
  let payload = {};
  const verifyAccountInfo = "/bank/resolve";
  const { accountNumber, bankCode } = req.body;

  const url = `${getters.getPayStackInfo().url}${verifyAccountInfo}`;
  const queryPayload = {
    // eslint-disable-next-line camelcase
    account_number: accountNumber,
    // eslint-disable-next-line camelcase
    bank_code: bankCode,
  };
  try {
    const postCustomerUpdate = createFetcher({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getters.getPayStackInfo().key}`,
      },
      method: "get",
      url,
      // eslint-disable-next-line camelcase
      query: { ...queryPayload },
      params: {},
      data: {},
      timeout: 60 * 9 * 1000, // 9 minutes
    });

    const verifyAccountResponse = await postCustomerUpdate.trigger();
    logger(verifyAccountResponse);

    if (verifyAccountResponse.payload.status == true) {
      statusCode = HttpStatusCode.OK;
      message = verifyAccountResponse.payload.message;
      payload = { accountInfo: verifyAccountResponse.payload.data };
    } else {
      statusCode = HttpStatusCode.UnprocessableEntity;
      message =
        verifyAccountResponse.payload.message || "Account verification failed.";
      payload = { error: "Verification unsuccessful" };
    }

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
      "Bank account verification error"
    );

    return responseObject({
      res,
      statusCode:
        errorResponse.statusCode || HttpStatusCode.InternalServerError,
      message: errorResponse.message,
      payload: errorResponse.payload || {},
    });
  }
};

const viewAllBanks: RequestHandler = async (req, res) => {
  let statusCode = HttpStatusCode.ServiceUnavailable;
  let message = `A critical error occurred. Kindly contact
   admin for details about a possible solution to this error.`;
  let payload = {};
  const verifyAccountInfo = "/bank";
  const {
    pay_with_bank_transfer,
    previous,
    next,
    perPage,
    use_cursor,
    country,
    gateway,
  } = req.body;

  const url = `${getters.getPayStackInfo().url}${verifyAccountInfo}`;
  const queryPayload = {
    pay_with_bank_transfer,
    previous,
    next,
    perPage,
    use_cursor,
    country,
    gateway,
  };
  try {
    const postCustomerUpdate = createFetcher({
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getters.getPayStackInfo().key}`,
      },
      method: "get",
      url,
      // eslint-disable-next-line camelcase
      query: {},
      params: { ...queryPayload },
      data: {},
      timeout: 60 * 9 * 1000, // 9 minutes
    });

    const verifyAccountResponse = await postCustomerUpdate.trigger();
    logger(verifyAccountResponse);

    if (verifyAccountResponse.payload.status == true) {
      statusCode = HttpStatusCode.OK;
      message = verifyAccountResponse.payload.message;
      payload = { banksInfo: verifyAccountResponse.payload.data };
    } else {
      statusCode = HttpStatusCode.UnprocessableEntity;
      message =
        verifyAccountResponse.payload.message || "Account verification failed.";
      payload = { error: "Verification unsuccessful" };
    }

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
      "Bank account verification error"
    );

    return responseObject({
      res,
      statusCode:
        errorResponse.statusCode || HttpStatusCode.InternalServerError,
      message: errorResponse.message,
      payload: errorResponse.payload || {},
    });
  }
};

export { verifyBankAccount, checkServiceHealth, viewAllBanks };
