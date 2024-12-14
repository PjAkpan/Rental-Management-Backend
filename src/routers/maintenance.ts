import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.maintenance.check().path]),
    method: constants.urls.maintenance.check().method,
    handlers: [controllers.maintenance.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.maintenance.createMaintenance().path]),
    method: constants.urls.maintenance.createMaintenance().method,
    handlers: [
      verifyMiddleware.validateCreateMaintenanceRequest,
      controllers.maintenance.addMaintenance,
    ],
  },
  {
    path: joinUrls([constants.urls.maintenance.deleteMaintenance().path]),
    method: constants.urls.maintenance.deleteMaintenance().method,
    handlers: [controllers.maintenance.deleteMaintenance],
  },
  {
    path: joinUrls([constants.urls.maintenance.modifyMaintenance().path]),
    method: constants.urls.maintenance.modifyMaintenance().method,
    handlers: [
      verifyMiddleware.updateMaintenanceInputRequest,
      controllers.maintenance.modifyMaintenance,
    ],
  },
  {
    path: joinUrls([constants.urls.maintenance.viewSingleMaintenance().path]),
    method: constants.urls.maintenance.viewSingleMaintenance().method,
    handlers: [controllers.maintenance.fetchSingleInfo],
  },
  {
    path: joinUrls([constants.urls.maintenance.viewAllMaintenance().path]),
    method: constants.urls.maintenance.viewAllMaintenance().method,
    handlers: [
      verifyMiddleware.validateVeiwAllInput,
      controllers.maintenance.fetchAllMaintenances,
    ],
  },
];

export default serviceLoader;
