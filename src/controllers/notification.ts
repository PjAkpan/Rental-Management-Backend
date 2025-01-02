import { HttpStatusCode, getters } from "../config";
import { logger } from "netwrap";
import {
  addIfNotEmpty,
  createHttpError,
  errorHandler,
  responseObject,
  sanitizeInput,
} from "../utils";
import type { RequestHandler } from "express";
import { notificationModel } from "../models";
import { Op } from "sequelize";
import { FindInfoParams } from "@/models/types";

const checkServiceHealth: RequestHandler = (_req, res) => {
  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const addNotification: RequestHandler = async (req, res) => {
  const { message, socketInfo, userID } = req.body;
  try {
    const createNotification = await notificationModel.saveNotification({
      message,
      socketInfo,
      userID,
    });
    return responseObject({
      res,
      statusCode: createNotification.statusCode,
      message: createNotification.message,
      payload: createNotification.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const deleteNotification: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await notificationModel.findNotificationById(id);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }

    const deleteNotification =
      await notificationModel.deleteNotificationById(id);
    return responseObject({
      res,
      statusCode: deleteNotification.statusCode,
      message: deleteNotification.message,
      payload: deleteNotification.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const modifyNotification: RequestHandler = async (req, res) => {
  const { status, socketInfo, requestId, userId, message } = req.body;
  let payload: any = {};
  try {
    const filter = { where: { id: requestId } };
    const check = await notificationModel.findNotification(filter);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }
    addIfNotEmpty(payload, "socketInfo", socketInfo);
    addIfNotEmpty(payload, "isActive", status);
    addIfNotEmpty(payload, "message", message);
    addIfNotEmpty(payload, "userID", userId);
    const updatedNotification = await notificationModel.updateNotificationById(
      requestId,
      payload,
    );
    return responseObject({
      res,
      statusCode: updatedNotification.statusCode,
      message: updatedNotification.message,
      payload: updatedNotification.payload,
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
    const check = await notificationModel.findNotificationById(id);
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

const fetchAllNotifications: RequestHandler = async (req, res) => {
  const {
    orderBy = "createdAt",
    sort = "DESC",
    size,
    page,
    startDate,
    endDate,
  }: FindInfoParams = req.query;
  let { gSearch, option }: any = req.query;
  let statusCode = 503;
  let message =
    "A critical error occurred. Kindly contact admin for details about a possible solution to this error";
  let payload = null;
  const columnMapping: any = {
    STATUS: "isActive",
  };
  try {
    const sizeNumber = size ? parseInt(size as unknown as string) : 10;
    const pageNumber = page ? parseInt(page as unknown as string) : 1;
    const filter: {
      order: string[][];
      limit: number;
      offset: number;
      attributes: {
        exclude: string[];
      };
      where: Record<string, any>;
    } = {
      order: [[orderBy, sort]],
      limit: sizeNumber,
      offset: sizeNumber * (pageNumber - 1),
      attributes: {
        exclude: ["updatedAt"],
      },
      where: {},
    };

    gSearch = Array.isArray(gSearch) ? gSearch : [gSearch];
    option = Array.isArray(option) ? option : [option];

    gSearch.forEach((searchValue: any, index: string | number) => {
      const opt = option[index] || option[0];
      const sanitizedSearchValue = searchValue;
      const sanitizedOption: any = sanitizeInput(opt || "");

      const columnName = columnMapping[sanitizedOption.toUpperCase()];

      const exactMatchColumns = ["isActive", "roomNumber"];

      if (sanitizedSearchValue && sanitizedOption) {
        if (columnName) {
          if (exactMatchColumns.includes(columnName)) {
            filter.where[columnName] = { [Op.eq]: sanitizedSearchValue };
          } else {
            filter.where[columnName] = {
              [Op.like]: "%{sanitizedSearchValue}%",
            };
          }
        } else {
          throw createHttpError("Invalid search option provided", 404);
        }
      }
    });
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filter.where.createdAt = {
        [Op.between]: [start, end],
      };
    }
    logger(filter);
    const response = await notificationModel.findAll(filter);
    message = response.message;
    payload = response.payload;
    statusCode = response.statusCode;
    if (!response.status) {
      return responseObject({
        res,
        statusCode,
        message,
        payload,
      });
    }

    const totalRecords = response.payload?.recordCount || 0;
    const totalPages = Math.ceil(totalRecords / sizeNumber);
    payload = {
      currentPage: pageNumber,
      totalRecords,
      totalPages,
      data: response.payload?.allRecords,
    };
    message = "Successfully fetched all records";
    return responseObject({
      res,
      statusCode: HttpStatusCode.OK,
      message,
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
  addNotification,
  modifyNotification,
  deleteNotification,
  fetchSingleInfo,
  fetchAllNotifications,
};
