import { DataTypes, Sequelize } from "sequelize";
import { maintenanceShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";
import { FindOptions } from "sequelize";
import { MaintenanceFilePathModel } from "./maintenanceFiles";
import { UserProfileModel } from "./userProfile";

const MaintenanceSchema = DBconnect.define(
  "tblMaintenance",
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
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subject: {
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
    tableName: "tblMaintenance",
    timestamps: true,
    freezeTableName: true,
  },
);

//MaintenanceSchema.sync({ alter: true });

export const MaintenanceModel = MaintenanceSchema;

// Create a new Maintenance entry
export const saveMaintenance = async (
  data: Record<string, maintenanceShemType>,
) => {
  try {
    const newMaintenance = await MaintenanceModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Maintenance created successfully",
      payload: newMaintenance as maintenanceShemType,
    };
  } catch (err) {
    console.error("Error creating Maintenance:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating Maintenance",
      payload: null,
    };
  }
};

// Find a Maintenance by any filter
export const findMaintenance = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const Maintenance = await MaintenanceModel.findOne(filter);
    if (!Maintenance) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Maintenance not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Maintenance found",
      payload: Maintenance,
    };
  } catch (err) {
    console.error("Error finding Maintenance:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Maintenance",
      payload: null,
    };
  }
};

// Find all Maintenances
export const findAll = async (filter: FindOptions) => {
  try {
    const [allRecords, recordCount] = await Promise.all([
      MaintenanceModel.findAll({
        ...filter,
        include: [
          {
            model: UserProfileModel,
            as: "userInfo",
            attributes: [
              "roomNumber",
              "profileImage",
              "email",
              "fullName",
              "phoneNumber",
            ],
          },
          {
            model: MaintenanceFilePathModel,
            as: "files", // Alias if needed
            on: Sequelize.literal(
              "\"tblMaintenance\".\"id\" = \"files\".\"requestId\"::uuid",
            ),
          },
        ],
      }),
      MaintenanceModel.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Maintenance not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Maintenances retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    console.error("Error retrieving Maintenances:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: "Error retrieving Maintenances",
      error: (err as Error).message || "Error retrieving Maintenances",
    };
  }
};

// Find a Maintenance by ID
export const findMaintenanceById = async (id: string) => {
  try {
    const Maintenance = await MaintenanceModel.findByPk(id);
    if (!Maintenance) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Maintenance not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Maintenance found",
      payload: Maintenance,
    };
  } catch (err) {
    console.error("Error finding Maintenance by ID:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Maintenance",
      payload: null,
    };
  }
};

// Update a Maintenance by ID
export const updateMaintenanceById = async (
  id: string | undefined,
  updateData: Partial<maintenanceShemType>,
) => {
  try {
    const [rowsUpdated, [updatedMaintenance]] = await MaintenanceModel.update(
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
        message: "No Maintenance records found to update",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Maintenance updated successfully",
      payload: updatedMaintenance,
    };
  } catch (err) {
    console.error("Error updating Maintenance:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error updating Maintenance",
      payload: null,
    };
  }
};

// Delete a Maintenance by ID
export const deleteMaintenanceById = async (id: string) => {
  try {
    const deletedMaintenance = await MaintenanceModel.destroy({
      where: { id },
    });
    if (!deletedMaintenance) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Maintenance not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Maintenance deleted successfully",
      payload: null,
    };
  } catch (err) {
    console.error("Error deleting Maintenance:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting Maintenance",
      payload: null,
    };
  }
};
