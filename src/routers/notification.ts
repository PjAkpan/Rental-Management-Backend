import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.notification.check().path]),
    method: constants.urls.notification.check().method,
    handlers: [controllers.notification.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.notification.createNotification().path]),
    method: constants.urls.notification.createNotification().method,
    handlers: [
      verifyMiddleware.validateCreateNotificationRequest,
      controllers.notification.addNotification,
    ],
  },
  {
    path: joinUrls([constants.urls.notification.deleteNotification().path]),
    method: constants.urls.notification.deleteNotification().method,
    handlers: [controllers.notification.deleteNotification],
  },
  {
    path: joinUrls([constants.urls.notification.modifyNotification().path]),
    method: constants.urls.notification.modifyNotification().method,
    handlers: [
      verifyMiddleware.updateNotificationInputRequest,
      controllers.notification.modifyNotification,
    ],
  },
  {
    path: joinUrls([constants.urls.notification.viewSingleNotification().path]),
    method: constants.urls.notification.viewSingleNotification().method,
    handlers: [controllers.notification.fetchSingleInfo],
  },
  {
    path: joinUrls([constants.urls.notification.viewAllNotification().path]),
    method: constants.urls.notification.viewAllNotification().method,
    handlers: [
      verifyMiddleware.validateVeiwAllInput,
      controllers.notification.fetchAllNotifications,
    ],
  },
];

export default serviceLoader;
