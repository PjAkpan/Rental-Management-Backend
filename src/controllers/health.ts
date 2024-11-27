import { HttpStatusCode, getters } from "../config";
import { responseObject } from "../utils";
import type { RequestHandler } from "express";

const checkServiceHealth: RequestHandler = (...rest) => {
  const res = rest[1];

  return responseObject({
    res,
    message: getters.geti18ns().LOGS.ROUTES.HEALTH_CHECK.SUCCESS,
    statusCode: HttpStatusCode.OK,
  });
};

export default { checkServiceHealth };
