import { Helpers } from "src/types/types";
import { logger } from "netwrap";
import { getFunctionName } from "./getFunctionName";

// eslint-disable-next-line require-jsdoc
function errorHandler<T = unknown, L = undefined>(
  err_: T,
  payload: L,
  defaultMessage?: string,
  resourceDescription?: string,
) {
  const err = err_ as Helpers.ErrorResponse;

  logger(
    {
      err,
      resourceDescription:
        resourceDescription || `Function: ${getFunctionName()} had an error`,
    },
    { shouldLog: true, isError: true },
  );

  if (err.status) {
    return {
      status: false,
      statusCode: err.status,
      message: err.message || "An error occurred",
      payload,
    };
  }

  if (err && err.response && err.response.data) {
    return {
      status: false,
      message: err.response.data.message,
      payload,
    };
  }

  if (err.message) {
    return {
      status: false,
      message: err.message,
      payload,
    };
  }

  return {
    status: false,
    message: defaultMessage || "An error occurred when fetching resource",
    payload,
  };
}

export { errorHandler };
