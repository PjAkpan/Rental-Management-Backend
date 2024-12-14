import { CustomWinstonLogger } from "../utils";
import { Request, Response, NextFunction, RequestHandler } from "express";
import morgan from "morgan";
// Middleware to capture the response body
const captureResponseBody: RequestHandler = (req, res, next) => {
  const originalSend = res.send;
  res.send = function (body: any) {
    res.locals.body = body; // Store the response body in res.locals
    return originalSend.apply(res, [body]); // Call the original res.send
  };
  next();
};

// Middleware for request and response logging
const requestHeaderInspection: RequestHandler = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  // Define a custom stream that logs messages to Winston
  const winstonStream = {
    write: (message: string) => {
      // logger(message.trim(), { shouldLog: true, isError: false });
      CustomWinstonLogger("debug", message.trim(), "HTTP request logging");
    },
  };

  // Configure Morgan to format logs and use Winston for output
  morgan((tokens, req, res) => {
    const expressReq = req as Request;
    const expressRes = res as Response;

    const logMessage = [
      tokens.method(req, res),
      tokens.url(req, res),
      tokens.status(req, res),
      tokens.res(req, res, "content-length"),
      "-",
      tokens["response-time"](req, res),
      "ms",
      "Request Params:",
      JSON.stringify(expressReq.params || "No Params"),
      "Request Query:",
      JSON.stringify(expressReq.query || "No Query"),
      "Request Body:",
      JSON.stringify(expressReq.body || "No Request Body"),
      "Response Body:",
      JSON.stringify(expressRes.locals.body || "No Response Body"),
    ].join(" ");
    winstonStream.write(logMessage); // Write to Winston logger
    return null; // Prevent Morgan's default logging
  })(req, res, next); // Invoke Morgan middleware
};

// Combine both middlewares
const captureInflowANDOutput: RequestHandler[] = [
  captureResponseBody, // Capture the response body
  requestHeaderInspection, // Log request and response
];

export default captureInflowANDOutput;
