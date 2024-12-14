import { DataTypes } from "sequelize";
import { DBconnect, HttpStatusCode } from "../config";

const MaintenanceFilePathSchema = DBconnect.define(
  "tblMaintenanceFilesPath",
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
    videoProof: {
      type: DataTypes.STRING,
      allowNull: false,
    },
  },
  {
    tableName: "tblMaintenanceFilesPath",
    timestamps: true,
    freezeTableName: true,
  },
);

//MaintenanceFilePathSchema.sync({ alter: true });

export const MaintenanceFilePathModel = MaintenanceFilePathSchema;

// Create a new Maintenance entry
export const saveMaintenanceFiles = async (data: Record<string, unknown>) => {
  try {
    const newMaintenance = await MaintenanceFilePathModel.create(data);
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Maintenance file path created successfully",
      payload: newMaintenance,
    };
  } catch (err) {
    console.error("Error creating Maintenance file path:", err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating Maintenance file path",
      payload: null,
    };
  }
};
