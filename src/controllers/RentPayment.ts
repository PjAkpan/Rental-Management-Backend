import { HttpStatusCode, getters } from "../config";
import {
  addIfNotEmpty,
  createHttpError,
  errorHandler,
  generateRentReceiptPDF,
  responseObject,
  sanitizeInput,
  uploadFiles,
} from "../utils";
import path from "path";
import fs from "fs/promises";
import type { RequestHandler } from "express";
import {
  RentPaymentFileModel,
  RentPaymentModel,
  tenancyPaymentModel,
} from "../models";
import fileUpload from "express-fileupload";
import { FindInfoParams } from "../models/types";
import { Op } from "sequelize";
import { logger } from "netwrap";

const checkServiceHealth: RequestHandler = (_req, res) => {
  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const addRentPayment: RequestHandler = async (req, res) => {
  const { userId, roomNumber, paymentDate, paymentAmount } = req.body;
  const files = req.files as
    | { [key: string]: fileUpload.UploadedFile }
    | undefined;

  // Extract files if they exist
  const pictureProof = files?.pictureProof as
    | fileUpload.UploadedFile
    | undefined;
  try {
    // File validation settings
    const allowedFileTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    const maxFileSize = 5 * 1024 * 1024; // 5 MB

    let filePaths: string[] = [];

    // Upload files only if they are provided
    if (pictureProof) {
      const filesToUpload = [];
      if (!allowedFileTypes.includes(pictureProof.mimetype)) {
        return responseObject({
          res,
          statusCode: HttpStatusCode.BadRequest,
          message:
            "Invalid file type. Only JPEG, JPG, PNG, and PDF are allowed.",
        });
      }
      if (pictureProof.size > maxFileSize) {
        return responseObject({
          res,
          statusCode: HttpStatusCode.BadRequest,
          message: "File size exceeds the 5 MB limit.",
        });
      }
      if (pictureProof) filesToUpload.push(pictureProof);

      filePaths = await uploadFiles(userId, filesToUpload, "rentPayment");
    }

    const createRentPayment = await RentPaymentModel.saveRentPayment({
      userId,
      roomNumber,
      paymentDate,
      paymentAmount,
      status: "pending",
    });

    // If files were uploaded, save file paths
    if (filePaths.length > 0) {
      await RentPaymentFileModel.saveRentPaymentFiles({
        userId,
        requestId: createRentPayment.payload?.id,
        pictureProof: filePaths[0] || null, // Path for pictureProof, if exists
      });
    }

    return responseObject({
      res,
      statusCode: createRentPayment.statusCode,
      message: createRentPayment.message,
      payload: createRentPayment.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const deleteRentPayment: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await RentPaymentModel.findRentPaymentById(id);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }

    const deleteRentPayment = await RentPaymentModel.deleteRentPaymentById(id);
    return responseObject({
      res,
      statusCode: deleteRentPayment.statusCode,
      message: deleteRentPayment.message,
      payload: deleteRentPayment.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const modifyRentPayment: RequestHandler = async (req, res) => {
  const { requestId, status, roomNumber, paymentDate, paymentAmount } =
    req.body;
  let payload: any = {};
  try {
    const filter = { where: { id: requestId } };
    const check = await RentPaymentModel.findRentPayment(filter);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }
    addIfNotEmpty(payload, "roomNumber", roomNumber);
    addIfNotEmpty(payload, "paymentAmount", paymentAmount);
    addIfNotEmpty(payload, "paymentDate", paymentDate);
    addIfNotEmpty(payload, "status", status);
    if (status == "active") {
      await RentPaymentModel.updateRentPaymentAll({
        isActive: false,
      });

      payload.isActive = true;
    }
    const updatedRentPayment = await RentPaymentModel.updateRentPaymentById(
      requestId,
      payload,
    );

    return responseObject({
      res,
      statusCode: updatedRentPayment.statusCode,
      message: updatedRentPayment.message,
      payload: updatedRentPayment.payload,
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
    const check = await RentPaymentModel.findRentPaymentById(id);
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

const fetchAllRentPayments: RequestHandler = async (req, res) => {
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
    USERID: "userId",
    STATUS: "status",
    ISACTIVE: "isActive",
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
    const response = await RentPaymentModel.findAll(filter);
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

const addTenancyPayment: RequestHandler = async (req, res) => {
  const { userId } = req.body;
  const files = req.files as
    | { [key: string]: fileUpload.UploadedFile }
    | undefined;

  // Extract files if they exist
  const pictureProof = files?.pictureProof as
    | fileUpload.UploadedFile
    | undefined;
  try {
    // File validation settings
    const allowedFileTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "application/pdf",
    ];
    const maxFileSize = 5 * 1024 * 1024; // 5 MB

    let filePaths: string[] = [];

    // Upload files only if they are provided
    if (pictureProof) {
      const filesToUpload = [];
      if (!allowedFileTypes.includes(pictureProof.mimetype)) {
        return responseObject({
          res,
          statusCode: HttpStatusCode.BadRequest,
          message:
            "Invalid file type. Only JPEG, JPG, PNG, and PDF are allowed.",
        });
      }
      if (pictureProof.size > maxFileSize) {
        return responseObject({
          res,
          statusCode: HttpStatusCode.BadRequest,
          message: "File size exceeds the 5 MB limit.",
        });
      }
      if (pictureProof) filesToUpload.push(pictureProof);

      filePaths = await uploadFiles(userId, filesToUpload, "tenancyPayment");
    }

    const createRentPayment = await tenancyPaymentModel.saveTenancyPaymentFiles(
      {
        userId,
        pictureProof: filePaths[0] || null, // Path for pictureProof, if exists
      },
    );

    return responseObject({
      res,
      statusCode: createRentPayment.statusCode,
      message: createRentPayment.message,
      payload: createRentPayment.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const fetchAllTenancyPayments: RequestHandler = async (req, res) => {
  const { orderBy = "createdAt", sort = "DESC", size, page } = req.query;
  try {
    const sizeNumber = parseInt(size as string) || 10;
    const pageNumber = parseInt(page as string) || 1;
    const filter: any = {
      order: [[orderBy, sort]],
      limit: sizeNumber,
      offset: sizeNumber * (pageNumber - 1),
    };
    const response = await tenancyPaymentModel.findAll(filter);

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

const generateTenancyPaymentsReceipt: RequestHandler = async (req, res) => {
  const { requestId } = req.params;
  try {
    let filter = {
      where: { id: requestId },
    };
    const response = await RentPaymentModel.findSingle(filter);

    if (!response.status) {
      return responseObject({
        res,
        statusCode: response.statusCode,
        message: response.message,
        payload: response.payload,
      });
    }

    const payload: any = response.payload;
    const pdfFilePath = path.join(
      __dirname,
      `../uploads/Rent_Receipt_${payload?.id}.pdf`,
    );
    payload.tenantName = payload["userData.fullName"];

    await generateRentReceiptPDF(payload, pdfFilePath);
    // Send the file for download
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Rent_Receipt_${payload?.id}.pdf`,
    );
    res.download(pdfFilePath, async (err) => {
      if (err) {
        console.error("Error while sending the file:", err);
        return responseObject({
          res,
          statusCode: HttpStatusCode.InternalServerError,
          message: "Failed to download the file.",
        });
      }

      // Clean up the file after sending
      await fs.unlink(pdfFilePath);
    });
    // return responseObject({
    //   res,
    //   statusCode: HttpStatusCode.OK,
    //   message: "Successfully fetched all records",
    //   payload,
    // });
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
  addRentPayment,
  modifyRentPayment,
  deleteRentPayment,
  fetchSingleInfo,
  fetchAllRentPayments,
  addTenancyPayment,
  fetchAllTenancyPayments,
  generateTenancyPaymentsReceipt,
};
