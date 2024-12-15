import { DataTypes, FindOptions } from "sequelize";
import { DBconnect, HttpStatusCode } from "../config";
import { UserProfileModel } from "./userProfile";

const TenancyPaymentFilesPathSchema = DBconnect.define(
  "tblTenancyPaymentFilesPath",
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
    pictureProof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "tblTenancyPaymentFilesPath",
    timestamps: true,
    freezeTableName: true,
  },
);

//TenancyPaymentFilesPathSchema.sync({ alter: true });

export const TenancyPaymentFilesPathModel = TenancyPaymentFilesPathSchema;

// Create a new TenancyPaymentFiles entry
export const saveTenancyPaymentFiles = async (
  data: Record<string, unknown>,
) => {
  try {
    const newTenancyPaymentFiles =
      await TenancyPaymentFilesPathModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Tenancy Payment file path created successfully",
      payload: newTenancyPaymentFiles,
    };
  } catch (err) {
    console.error("Error creating Tenancy Payment  file path:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message:
        (err as Error).message || "Error creating Tenancy Payment  file path",
      payload: null,
    };
  }
};

export const findAll = async (filter: FindOptions) => {
  try {
    const [allRecords, recordCount] = await Promise.all([
      TenancyPaymentFilesPathModel.findAll({
        ...filter,
        include: [
          {
            model: UserProfileModel,
            as: "userInfo",
            attributes: ["profileId", "fullName", "phoneNumber", "roomNumber"],
          },
        ],
      }),
      TenancyPaymentFilesPathModel.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Tenancy Payment not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Tenancy Payments retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    console.error("Error retrieving Tenancy Payments:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: "Error retrieving Tenancy Payments",
      error: (err as Error).message || "Error retrieving Tenancy Payments",
    };
  }
};
