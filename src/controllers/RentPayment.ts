import { HttpStatusCode, getters } from "../config";
import {
  addIfNotEmpty,
  errorHandler,
  responseObject,
  uploadFiles,
} from "../utils";
import type { RequestHandler } from "express";
import {
  RentPaymentFileModel,
  RentPaymentModel,
  tenancyPaymentModel,
} from "../models";
import fileUpload from "express-fileupload";

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
  const { requestId, roomNumber, paymentDate, paymentAmount } = req.body;
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
  const { orderBy = "createdAt", sort = "DESC", size, page } = req.query;
  try {
    const sizeNumber = parseInt(size as string) || 10;
    const pageNumber = parseInt(page as string) || 1;
    const filter: any = {
      order: [[orderBy, sort]],
      limit: sizeNumber,
      offset: sizeNumber * (pageNumber - 1),
    };
    const response = await RentPaymentModel.findAll(filter);

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
export {
  checkServiceHealth,
  addRentPayment,
  modifyRentPayment,
  deleteRentPayment,
  fetchSingleInfo,
  fetchAllRentPayments,
  addTenancyPayment,
  fetchAllTenancyPayments,
};
