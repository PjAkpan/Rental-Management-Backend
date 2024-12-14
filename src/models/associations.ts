import { MaintenanceModel } from "./maintenance";
import { MaintenanceFilePathModel } from "./maintenanceFiles";

export const setupAssociations = async () => {
  MaintenanceModel.hasMany(MaintenanceFilePathModel, {
    as: "files",
    foreignKey: "requestId", // Link to requestId in the MaintenanceFilePath table
    sourceKey: "id", // Link to the id of the Maintenance model});
  });
  MaintenanceFilePathModel.belongsTo(MaintenanceModel, {
    as: "maintenance",
    foreignKey: "requestId", // Maintenance record's ID is linked to requestId in the file path
    targetKey: "id", // Link on the 'id' of the Maintenance model
  });
};
