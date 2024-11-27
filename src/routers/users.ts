import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.users.check().path]),
    method: constants.urls.users.check().method,
    handlers: [controllers.users.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.users.createUsers().path]),
    method: constants.urls.users.createUsers().method,
    handlers: [
      verifyMiddleware.validateCreateUsersRequest,
      controllers.users.addUsers,
    ],
  },
  {
    path: joinUrls([constants.urls.users.deleteUsers().path]),
    method: constants.urls.users.deleteUsers().method,
    handlers: [controllers.users.deleteUsers],
  },
  {
    path: joinUrls([constants.urls.users.modifyUsers().path]),
    method: constants.urls.users.modifyUsers().method,
    handlers: [
      verifyMiddleware.updateUsersInputRequest,
      controllers.users.modifyUsers,
    ],
  },
  {
    path: joinUrls([constants.urls.users.viewSingleUsers().path]),
    method: constants.urls.users.viewSingleUsers().method,
    handlers: [controllers.users.fetchSingleInfo],
  },
  {
    path: joinUrls([constants.urls.users.viewAllUsers().path]),
    method: constants.urls.users.viewAllUsers().method,
    handlers: [
      verifyMiddleware.validateVeiwAllInput,
      controllers.users.fetchAllUserss,
    ],
  },
  {
    path: joinUrls([constants.urls.users.loginUsers().path]),
    method: constants.urls.users.loginUsers().method,
    handlers: [
      verifyMiddleware.validateLoginUsersRequest,
      controllers.users.loginUsers,
    ],
  },
  {
    path: joinUrls([constants.urls.users.mobileUsersLogin().path]),
    method: constants.urls.users.mobileUsersLogin().method,
    handlers: [
      verifyMiddleware.validateMobileLoginUsersRequest,
      controllers.users.mobileLoginUsers,
    ],
  },
  {
    path: joinUrls([constants.urls.users.logoutAllDevices().path]),
    method: constants.urls.users.logoutAllDevices().method,
    handlers: [
      verifyMiddleware.validateLogoutUsersRequest,
      controllers.users.logoutAllDevices,
    ],
  },
];

export default serviceLoader;
