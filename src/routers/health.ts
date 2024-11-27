import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.health.check().path]),
    method: constants.urls.health.check().method,
    handlers: [controllers.health.checkServiceHealth],
  },
];

export default serviceLoader;
