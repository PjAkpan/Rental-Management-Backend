import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.resources.check().path]),
    method: constants.urls.resources.check().method,
    handlers: [controllers.resources.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.resources.viewBanks().path]),
    method: constants.urls.resources.viewBanks().method,
    handlers: [
      verifyMiddleware.validateViewBankstRequest,
      controllers.resources.viewAllBanks,
    ],
  },
  {
    path: joinUrls([constants.urls.resources.verifyBankAccount().path]),
    method: constants.urls.resources.verifyBankAccount().method,
    handlers: [
      verifyMiddleware.validateUserAccountRequest,
      controllers.resources.verifyBankAccount,
    ],
  },
];

export default serviceLoader;
