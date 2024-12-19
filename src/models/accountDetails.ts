import { DataTypes } from "sequelize";
import { accountDetailsShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";
import { FindOptions } from "sequelize";

const AccountDetailsSchema = DBconnect.define(
  "tblAccountDetails",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },
    bankName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountNumber: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    accountName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: true,
    },
    // isDeleted: {
    //   type: DataTypes.BOOLEAN,
    //   allowNull: true,
    //   defaultValue: false,
    // },
  },
  {
    tableName: "tblAccountDetails",
    timestamps: true,
    freezeTableName: true,
  },
);

//AccountDetailsSchema.sync({ alter: true });

export const AccountDetailsModel = AccountDetailsSchema;

// Create a new AccountDetails entry
export const saveAccountDetails = async (data: Record<string, unknown>) => {
  try {
    const newAccountDetails = await AccountDetailsModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "AccountDetails created successfully",
      payload: newAccountDetails,
    };
  } catch (err) {
    console.error("Error creating AccountDetails:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating AccountDetails",
      payload: null,
    };
  }
};

// Find a AccountDetails by any filter
export const findAccountDetails = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const AccountDetails = await AccountDetailsModel.findOne(filter);
    if (!AccountDetails) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "AccountDetails not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "AccountDetails found",
      payload: AccountDetails,
    };
  } catch (err) {
    console.error("Error finding AccountDetails:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding AccountDetails",
      payload: null,
    };
  }
};

// Find all AccountDetailss
export const findAll = async (filter: FindOptions) => {
  try {
    const [allRecords, recordCount] = await Promise.all([
      AccountDetailsModel.findAll(filter),
      AccountDetailsModel.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "AccountDetails not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "AccountDetailss retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    console.error("Error retrieving AccountDetailss:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: "Error retrieving AccountDetailss",
      error: (err as Error).message || "Error retrieving AccountDetailss",
    };
  }
};

// Find a AccountDetails by ID
export const findAccountDetailsById = async (id: string) => {
  try {
    const AccountDetails = await AccountDetailsModel.findByPk(id);
    if (!AccountDetails) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "AccountDetails not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "AccountDetails found",
      payload: AccountDetails,
    };
  } catch (err) {
    console.error("Error finding AccountDetails by ID:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding AccountDetails",
      payload: null,
    };
  }
};

// Update a AccountDetails by ID
export const updateAccountDetailsById = async (
  id: string | undefined,
  updateData: Partial<accountDetailsShemType>,
) => {
  try {
    const [rowsUpdated, [updatedAccountDetails]] =
      await AccountDetailsModel.update(updateData, {
        where: { id },
        returning: true, // To return the updated record
      });
    if (rowsUpdated === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No AccountDetails records found to update",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "AccountDetails updated successfully",
      payload: updatedAccountDetails,
    };
  } catch (err) {
    console.error("Error updating AccountDetails:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error updating AccountDetails",
      payload: null,
    };
  }
};

// Delete a AccountDetails by ID
export const deleteAccountDetailsById = async (id: string) => {
  try {
    const deletedAccountDetails = await AccountDetailsModel.destroy({
      where: { id },
    });
    if (!deletedAccountDetails) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "AccountDetails not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "AccountDetails deleted successfully",
      payload: null,
    };
  } catch (err) {
    console.error("Error deleting AccountDetails:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting AccountDetails",
      payload: null,
    };
  }
};
