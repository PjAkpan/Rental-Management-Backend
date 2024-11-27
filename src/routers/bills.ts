import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.bills.check().path]),
    method: constants.urls.bills.check().method,
    handlers: [controllers.bills.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.bills.createBills().path]),
    method: constants.urls.bills.createBills().method,
    handlers: [controllers.bills.createBills],
  },
];

export default serviceLoader;
