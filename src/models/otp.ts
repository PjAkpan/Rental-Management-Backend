/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataTypes } from "sequelize";
import { otpShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";
import { logger } from "netwrap";



const OtpSchema = DBconnect.define(
  "tblOtp",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    otpNumber: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    referenceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    deviceId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    initiatorId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    otpTime: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    tableName: "tblOtp",
    timestamps: true,
    freezeTableName: true,
  },
);

//OtpSchema.sync({ alter: true });

export const OtpModel = OtpSchema;

// Create a new Otp entry
export const saveOtp = async (data: Record<string, unknown>) => {
  try {
    const newOtp = await OtpModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Otp created successfully",
      payload: newOtp,
    };
  } catch (err) {
    logger("Error creating Otp:", { shouldLog: true, isError: true });
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating Otp",
      payload: null,
    };
  }
};

// Find a Otp by any filter
export const findOtp = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const Otp = await OtpModel.findOne(filter);
    if (!Otp) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Otp not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Otp found",
      payload: Otp,
    };
  } catch (err) {
    logger("Error finding Otp:", { shouldLog: true, isError: true });
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Otp",
      payload: null,
    };
  }
};

// Find all Otps
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findAll = async (filter: any) => {
  try {
    const [allRecords, recordCount] = await Promise.all([
      OtpModel.findAll(filter),
      OtpModel.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Otp not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Otps retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    logger("Error retrieving Otps:", { shouldLog: true, isError: true });
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: "Error retrieving Otps",
      error: (err as Error).message || "Error retrieving Otps",
    };
  }
};

// Find a Otp by ID
export const findOtpById = async (id: string) => {
  try {
    const Otp = await OtpModel.findByPk(id);
    if (!Otp) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Otp not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Otp found",
      payload: Otp,
    };
  } catch (err) {
    logger("Error finding Otp by ID:", { shouldLog: true, isError: true });
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Otp",
      payload: null,
    };
  }
};

// Update a Otp by ID
export const updateOtpById = async (
  id: string,
  updateData: Partial<otpShemType>,
) => {
  try {
    const [rowsUpdated, [updatedOtp]] = await OtpModel.update(updateData, {
      where: { id },
      returning: true, // To return the updated record
    });
    if (rowsUpdated === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No Otp records found to update",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Otp updated successfully",
      payload: updatedOtp,
    };
  } catch (err) {
    logger("Error updating Otp:", { shouldLog: true, isError: true });
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error updating Otp",
      payload: null,
    };
  }
};

// Delete a Otp by ID
export const deleteOtpById = async (id: string) => {
  try {
    const deletedOtp = await OtpModel.destroy({ where: { id } });
    if (!deletedOtp) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Otp not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Otp deleted successfully",
      payload: null,
    };
  } catch (err) {
    logger("Error deleting Otp:", { shouldLog: true, isError: true });
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting Otp",
      payload: null,
    };
  }
};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const deleteMultipleRows = async (filter: any) => {
  try {
    const deletedOtp = await OtpModel.destroy(filter);
    if (!deletedOtp) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Otp not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Otp deleted successfully",
      payload: null,
    };
  } catch (err) {
    logger("Error deleting Otp:", { shouldLog: true, isError: true });
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting Otp",
      payload: null,
    };
  }
};

export function findOtpByReferenceId(referenceId: any) {
  throw new Error("Function not implemented.");
}
