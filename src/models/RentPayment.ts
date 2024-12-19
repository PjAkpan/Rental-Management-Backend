import { DataTypes, Sequelize } from "sequelize";
import { RentPaymentShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";
import { RentPaymentFilePathModel } from "./rentPaymentFiles";

const RentPaymentSchema = DBconnect.define(
  "tblRentPayment",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    roomNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentAmount: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    paymentDate: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    nextRentDueDate: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
  },
  {
    tableName: "tblRentPayment",
    timestamps: true,
    freezeTableName: true,
    hooks: {
      beforeCreate: (rentPayment: RentPaymentShemType) => {
        if (rentPayment.paymentDate) {
          const paymentDate = new Date(rentPayment.paymentDate);
          rentPayment.nextRentDueDate = new Date(
            paymentDate.setFullYear(paymentDate.getFullYear() + 1),
          ).toISOString();
        }
      },
      beforeUpdate: (rentPayment) => {
        if (rentPayment.paymentDate) {
          const paymentDate = new Date(rentPayment.paymentDate);
          rentPayment.nextRentDueDate = new Date(
            paymentDate.setFullYear(paymentDate.getFullYear() + 1),
          ).toISOString();
        }
      },
    },
  },
);

//RentPaymentSchema.sync({ alter: true });

export const RentPaymentModel = RentPaymentSchema;

// Create a new RentPayment entry
export const saveRentPayment = async (data: Record<string, unknown>) => {
  try {
    const newRentPayment = await RentPaymentModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Payment receipt uploaded successfully",
      payload: newRentPayment,
    };
  } catch (err) {
    console.error("Error creating RentPayment:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating RentPayment",
      payload: null,
    };
  }
};

// Find a RentPayment by any filter
export const findRentPayment = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const RentPayment = await RentPaymentModel.findOne(filter);
    if (!RentPayment) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "RentPayment not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "RentPayment found",
      payload: RentPayment,
    };
  } catch (err) {
    console.error("Error finding RentPayment:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding RentPayment",
      payload: null,
    };
  }
};

// Find all RentPayments
export const findAll = async (filter: any) => {
  try {
    const [allRecords, recordCount] = await Promise.all([
      RentPaymentModel.findAll({
        ...filter,
        include: [
          {
            model: RentPaymentFilePathModel,
            as: "repaymentFiles", // Alias if needed
            on: Sequelize.literal(
              "\"tblRentPayment\".\"id\" = \"repaymentFiles\".\"requestId\"::uuid",
            ),
          },
        ],
      }),
      RentPaymentModel.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "RentPayment not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "RentPayments retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    console.error("Error retrieving RentPayments:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: "Error retrieving RentPayments",
      error: (err as Error).message || "Error retrieving RentPayments",
    };
  }
};

// Find a RentPayment by ID
export const findRentPaymentById = async (id: string) => {
  try {
    const RentPayment = await RentPaymentModel.findByPk(id);
    if (!RentPayment) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "RentPayment not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "RentPayment found",
      payload: RentPayment,
    };
  } catch (err) {
    console.error("Error finding RentPayment by ID:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding RentPayment",
      payload: null,
    };
  }
};

// Update a RentPayment by ID
export const updateRentPaymentById = async (
  id: string | undefined,
  updateData: Partial<RentPaymentShemType>,
) => {
  try {
    const [rowsUpdated, [updatedRentPayment]] = await RentPaymentModel.update(
      updateData,
      {
        where: { id },
        returning: true, // To return the updated record
      },
    );
    if (rowsUpdated === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No RentPayment records found to update",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "RentPayment updated successfully",
      payload: updatedRentPayment,
    };
  } catch (err) {
    console.error("Error updating RentPayment:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error updating RentPayment",
      payload: null,
    };
  }
};

// Delete a RentPayment by ID
export const deleteRentPaymentById = async (id: string) => {
  try {
    const deletedRentPayment = await RentPaymentModel.destroy({
      where: { id },
    });
    if (!deletedRentPayment) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "RentPayment not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "RentPayment deleted successfully",
      payload: null,
    };
  } catch (err) {
    console.error("Error deleting RentPayment:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting RentPayment",
      payload: null,
    };
  }
};
