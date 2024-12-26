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
import { roomsModel } from "../models";
import { Op } from "sequelize";
import { FindInfoParams } from "@/models/types";

const checkServiceHealth: RequestHandler = (_req, res) => {
  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const addRooms: RequestHandler = async (req, res) => {
  const { roomNumber } = req.body;
  try {
    const filter = { where: { roomNumber: { [Op.like]: `%${roomNumber}%` } } };
    const check = await roomsModel.findRooms(filter);

    if (check.status) {
      return responseObject({
        res,
        statusCode: HttpStatusCode.Conflict,
        message: check.message,
        payload: check.payload,
      });
    }

    const createRooms = await roomsModel.saveRooms({
      roomStatus: "available",
      roomNumber,
    });
    return responseObject({
      res,
      statusCode: createRooms.statusCode,
      message: createRooms.message,
      payload: createRooms.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const deleteRooms: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await roomsModel.findRoomsById(id);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }

    const deleteRooms = await roomsModel.deleteRoomsById(id);
    return responseObject({
      res,
      statusCode: deleteRooms.statusCode,
      message: deleteRooms.message,
      payload: deleteRooms.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const modifyRooms: RequestHandler = async (req, res) => {
  const { roomStatus, requestId, roomNumber } = req.body;
  let payload: any = {};
  try {
    const filter = { where: { id: requestId } };
    const check = await roomsModel.findRooms(filter);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }
    addIfNotEmpty(payload, "roomNumber", roomNumber);
    addIfNotEmpty(payload, "roomStatus", roomStatus);
    const updatedRooms = await roomsModel.updateRoomsById(requestId, payload);
    return responseObject({
      res,
      statusCode: updatedRooms.statusCode,
      message: updatedRooms.message,
      payload: updatedRooms.payload,
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
    const check = await roomsModel.findRoomsById(id);
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

const fetchAllRoomss: RequestHandler = async (req, res) => {
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
    STATUS: "roomStatus",
    ROOMNUMBER: "roomNumber",
    // Add any additional mappings as necessary
  };
  try {
    // Convert size and page to numbers
    const sizeNumber = size ? parseInt(size as unknown as string) : 10;
    const pageNumber = page ? parseInt(page as unknown as string) : 1;
    const filter: {
      order: string[][];
      limit: number;
      offset: number;
      attributes: {
        exclude: string[];
      };
      where: Record<string, any>; // Allow dynamic keys in the where clause
    } = {
      order: [[orderBy, sort]],
      limit: sizeNumber,
      offset: sizeNumber * (pageNumber - 1),
      attributes: {
        exclude: ["updatedAt"], // Specify the columns to exclude
      },
      where: {}, // Initialize as an object with dynamic keys
    };

    // Ensure gSearch and option are arrays
    gSearch = Array.isArray(gSearch) ? gSearch : [gSearch];
    option = Array.isArray(option) ? option : [option];

    // Iterate over gSearch and option arrays and add filters accordingly
    gSearch.forEach((searchValue: any, index: string | number) => {
      const opt = option[index] || option[0]; // Use corresponding option or the first option if not enough
      const sanitizedSearchValue = searchValue;
      // opt === "UPLOADEDFILEID" ? searchValue || "" : sanitizeInput(searchValue || "");
      const sanitizedOption: any = sanitizeInput(opt || "");

      // Convert the user input to the corresponding column name
      const columnName = columnMapping[sanitizedOption.toUpperCase()];

      // List of columns that should use exact matching (Op.eq)
      const exactMatchColumns = ["isActive", "roomNumber"];

      // Add search filter if gSearch and option are valid
      if (sanitizedSearchValue && sanitizedOption) {
        if (columnName) {
          // Use exact match for specific columns, otherwise use a LIKE search
          if (exactMatchColumns.includes(columnName)) {
            filter.where[columnName] = { [Op.eq]: sanitizedSearchValue };
          } else {
            filter.where[columnName] = {
              [Op.like]: `%${sanitizedSearchValue}%`,
            };
          }
        } else {
          // Handle invalid option
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
    const response = await roomsModel.findAll(filter);
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
  addRooms,
  modifyRooms,
  deleteRooms,
  fetchSingleInfo,
  fetchAllRoomss,
};
