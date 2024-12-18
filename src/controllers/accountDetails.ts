import { HttpStatusCode, getters } from "../config";
import { addIfNotEmpty, errorHandler, responseObject } from "../utils";
import type { RequestHandler } from "express";
import { accountDetailsModel } from "../models";

const checkServiceHealth: RequestHandler = (_req, res) => {
  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const addAccountDetails: RequestHandler = async (req, res) => {
  const { accountName, accountNumber, bankName } = req.body;
  try {
    const filter = { where: { accountNumber: accountNumber } };
    const check = await accountDetailsModel.findAccountDetails(filter);

    if (check.status) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.Conflict,
        message: check.message,
        payload: check.payload,
      });
    }

    const createAccountDetails = await accountDetailsModel.saveAccountDetails({
      accountName,
      accountNumber,
      bankName,
    });
    return responseObject({
      res,
      statusCode: createAccountDetails.statusCode,
      message: createAccountDetails.message,
      payload: createAccountDetails.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const deleteAccountDetails: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await accountDetailsModel.findAccountDetailsById(id);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }

    const deleteAccountDetails =
      await accountDetailsModel.deleteAccountDetailsById(id);
    return responseObject({
      res,
      statusCode: deleteAccountDetails.statusCode,
      message: deleteAccountDetails.message,
      payload: deleteAccountDetails.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const modifyAccountDetails: RequestHandler = async (req, res) => {
  const { status, accountName, accountNumber, requestId, bankName } = req.body;
  let payload: any = {};
  try {
    const filter = { where: { id: requestId } };
    const check = await accountDetailsModel.findAccountDetails(filter);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }
    addIfNotEmpty(payload, "bankName", bankName);
    addIfNotEmpty(payload, "accountNumber", accountNumber);
    addIfNotEmpty(payload, "accountName", accountName);
    addIfNotEmpty(payload, "isActive", status);
    const updatedAccountDetails =
      await accountDetailsModel.updateAccountDetailsById(requestId, payload);
    return responseObject({
      res,
      statusCode: updatedAccountDetails.statusCode,
      message: updatedAccountDetails.message,
      payload: updatedAccountDetails.payload,
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
    const check = await accountDetailsModel.findAccountDetailsById(id);
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

const fetchAllAccountDetailss: RequestHandler = async (req, res) => {
  const { orderBy = "createdAt", sort = "DESC", size, page } = req.query;
  try {
    const sizeNumber = parseInt(size as string) || 10;
    const pageNumber = parseInt(page as string) || 1;
    const filter: any = {
      order: [[orderBy, sort]],
      limit: sizeNumber,
      offset: sizeNumber * (pageNumber - 1),
    };
    const response = await accountDetailsModel.findAll(filter);

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

export {
  checkServiceHealth,
  addAccountDetails,
  modifyAccountDetails,
  deleteAccountDetails,
  fetchSingleInfo,
  fetchAllAccountDetailss,
};
