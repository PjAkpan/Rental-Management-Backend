import { DataTypes } from "sequelize";
import { DBconnect, HttpStatusCode } from "../config";

const RentPaymentFilePathSchema = DBconnect.define(
  "tblRentPaymentFilesPath",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    requestId: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    pictureProof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "tblRentPaymentFilesPath",
    timestamps: true,
    freezeTableName: true,
  },
);

//RentPaymentFilePathSchema.sync({ alter: true });

export const RentPaymentFilePathModel = RentPaymentFilePathSchema;

// Create a new RentPayment entry
export const saveRentPaymentFiles = async (data: Record<string, unknown>) => {
  try {
    const newRentPayment = await RentPaymentFilePathModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "RentPayment file path created successfully",
      payload: newRentPayment,
    };
  } catch (err) {
    console.error("Error creating RentPayment file path:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating RentPayment file path",
      payload: null,
    };
  }
};
