import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.accountDetails.check().path]),
    method: constants.urls.accountDetails.check().method,
    handlers: [controllers.accountDetails.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.accountDetails.createAccountDetails().path]),
    method: constants.urls.accountDetails.createAccountDetails().method,
    handlers: [verifyMiddleware.validateCreateAccountDetailsRequest, controllers.accountDetails.addAccountDetails],
  },
  {
    path: joinUrls([constants.urls.accountDetails.deleteAccountDetails().path]),
    method: constants.urls.accountDetails.deleteAccountDetails().method,
    handlers: [controllers.accountDetails.deleteAccountDetails],
  },
  {
    path: joinUrls([constants.urls.accountDetails.modifyAccountDetails().path]),
    method: constants.urls.accountDetails.modifyAccountDetails().method,
    handlers: [
      verifyMiddleware.updateAccountDetailsInputRequest,
      controllers.accountDetails.modifyAccountDetails,
    ],
  },
  {
    path: joinUrls([constants.urls.accountDetails.viewSingleAccountDetails().path]),
    method: constants.urls.accountDetails.viewSingleAccountDetails().method,
    handlers: [controllers.accountDetails.fetchSingleInfo],
  },
  {
    path: joinUrls([constants.urls.accountDetails.viewAllAccountDetails().path]),
    method: constants.urls.accountDetails.viewAllAccountDetails().method,
    handlers: [
      verifyMiddleware.validateVeiwAllInput,
      controllers.accountDetails.fetchAllAccountDetailss,
    ],
  },

];

export default serviceLoader;
