import { HttpStatusCode, getters } from "../config";
import {
  addIfNotEmpty,
  errorHandler,
  responseObject,
  uploadFiles,
} from "../utils";
import type { RequestHandler } from "express";
import { MaintenanceFilePathModel, maintenanceModel } from "../models";
import fileUpload from "express-fileupload";

const checkServiceHealth: RequestHandler = (_req, res) => {
  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

const addMaintenance: RequestHandler = async (req, res) => {
  const { description, subject, userId } = req.body;
  const files = req.files as
    | { [key: string]: fileUpload.UploadedFile }
    | undefined;

  // Extract files if they exist
  const pictureProof = files?.pictureProof as
    | fileUpload.UploadedFile
    | undefined;
  const videoProof = files?.videoProof as fileUpload.UploadedFile | undefined;

  try {
    // File validation settings
    const allowedFileTypes = ["image/jpeg", "image/jpg", "image/png"];
    const maxFileSize = 5 * 1024 * 1024; // 5 MB

    let filePaths: string[] = [];

    // Upload files only if they are provided
    if (pictureProof || videoProof) {
      const filesToUpload = [];
      if (pictureProof) {
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
        filesToUpload.push(pictureProof);
      }

      if (videoProof) filesToUpload.push(videoProof);

      filePaths = await uploadFiles(userId, filesToUpload, "maintenance");
    }

    // Save maintenance record (files are optional)
    const createMaintenance = await maintenanceModel.saveMaintenance({
      description,
      subject,
      userId,
    });

    // If files were uploaded, save file paths
    if (filePaths.length > 0) {
      await MaintenanceFilePathModel.saveMaintenanceFiles({
        userId,
        requestId: createMaintenance.payload?.id,
        pictureProof: filePaths[0] || null, // Path for pictureProof, if exists
        videoProof: filePaths[1] || null, // Path for videoProof, if exists
      });
    }

    return responseObject({
      res,
      statusCode: createMaintenance.statusCode,
      message: createMaintenance.message,
      payload: createMaintenance.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const deleteMaintenance: RequestHandler = async (req, res) => {
  const { id } = req.params;
  try {
    const check = await maintenanceModel.findMaintenanceById(id);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }

    const deleteMaintenance = await maintenanceModel.deleteMaintenanceById(id);
    return responseObject({
      res,
      statusCode: deleteMaintenance.statusCode,
      message: deleteMaintenance.message,
      payload: deleteMaintenance.payload,
    });
  } catch (err) {
    return responseObject({
      res,
      statusCode: HttpStatusCode.InternalServerError,
      message: errorHandler(err, null).message,
    });
  }
};

const modifyMaintenance: RequestHandler = async (req, res) => {
  const { status, MaintenanceId, userId, subject, description } = req.body;
  let payload: any = {};
  try {
    const filter = { where: { id: MaintenanceId } };
    const check = await maintenanceModel.findMaintenance(filter);

    if (!check.status) {
      return responseObject({
        res,
        statusCode: check.statusCode,
        message: check.message,
        payload: check.payload,
      });
    }
    addIfNotEmpty(payload, "description", description);
    addIfNotEmpty(payload, "subject", subject);
    addIfNotEmpty(payload, "userId", userId);

    payload.isActive = status;
    const updatedMaintenance = await maintenanceModel.updateMaintenanceById(
      MaintenanceId,
      payload,
    );
    return responseObject({
      res,
      statusCode: updatedMaintenance.statusCode,
      message: updatedMaintenance.message,
      payload: updatedMaintenance.payload,
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
    const check = await maintenanceModel.findMaintenanceById(id);
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

const fetchAllMaintenances: RequestHandler = async (req, res) => {
  const { orderBy = "createdAt", sort = "DESC", size, page } = req.query;
  try {
    const sizeNumber = parseInt(size as string) || 10;
    const pageNumber = parseInt(page as string) || 1;
    const filter: any = {
      order: [[orderBy, sort]],
      limit: sizeNumber,
      offset: sizeNumber * (pageNumber - 1),
    };
    const response = await maintenanceModel.findAll(filter);

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
  addMaintenance,
  modifyMaintenance,
  deleteMaintenance,
  fetchSingleInfo,
  fetchAllMaintenances,
};
