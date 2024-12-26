import { MaintenanceModel } from "./maintenance";
import { MaintenanceFilePathModel } from "./maintenanceFiles";
import { RentPaymentModel } from "./RentPayment";
import { RentPaymentFilePathModel } from "./rentPaymentFiles";
import { TenancyPaymentFilesPathModel } from "./tenancyPaymentFiles";
import { UserProfileModel } from "./userProfile";

export const setupAssociations = async () => {
  MaintenanceModel.hasMany(MaintenanceFilePathModel, {
    as: "files",
    foreignKey: "requestId", // Link to requestId in the MaintenanceFilePath table
    sourceKey: "id", // Link to the id of the Maintenance model});
  });
  MaintenanceModel.belongsTo(UserProfileModel, {
    as: "userInfo",
    foreignKey: "userId", // Link to requestId in the MaintenanceFilePath table
    targetKey: "profileId", // Link to the id of the Maintenance model});
  });
  MaintenanceFilePathModel.belongsTo(MaintenanceModel, {
    as: "maintenance",
    foreignKey: "requestId", // Maintenance record's ID is linked to requestId in the file path
    targetKey: "id", // Link on the 'id' of the Maintenance model
  });

  RentPaymentModel.hasMany(RentPaymentFilePathModel, {
    as: "repaymentFiles",
    foreignKey: "requestId", // Link to requestId in the MaintenanceFilePath table
    sourceKey: "id", // Link to the id of the Maintenance model});
  });
  RentPaymentFilePathModel.belongsTo(RentPaymentModel, {
    as: "rentPayment",
    foreignKey: "requestId", // Maintenance record's ID is linked to requestId in the file path
    targetKey: "id", // Link on the 'id' of the Maintenance model
  });
  TenancyPaymentFilesPathModel.belongsTo(UserProfileModel, {
    as: "userInfo",
    foreignKey: "userId", // Maintenance record's ID is linked to requestId in the file path
    targetKey: "profileId", // Link on the 'id' of the Maintenance model
  });
};
