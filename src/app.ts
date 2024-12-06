import express, { Request, Response } from "express";

import cors from "cors";
import { getters, postgresLoader } from "./config";
import loadRoutes from "./utils/loadRoutes";
import helmet from "helmet";
import { forbiddenPaths, requestHeaderInspection } from "./middlewares";
import { logger } from "netwrap";
import path from "path";

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

app.use(cors(corsOptions));

app.use(express.json());

app.use(helmet());

app.use("*", forbiddenPaths);

app.use(requestHeaderInspection);

const routeFolder = path.resolve(__dirname, "./routers");
const port = getters.getAppPort();

// // Use custom middleware to capture response body
// app.use(captureResponseBody);
// // Define a custom stream that uses Winston
// const winstonStream = {
//   write: (message: any) => {
//     // Log the message as 'info' level to Winston
//     CustomWinstonLogger("debug", message.trim(), "all inComming http request");
//   },
// };
// app.use(
//   morgan((tokens, req, res) => {
//     const logMessage = [
//       tokens.method(req, res),
//       tokens.url(req, res),
//       tokens.status(req, res),
//       tokens.res(req, res, "content-length"),
//       "-",
//       tokens["response-time"](req, res),
//       "ms",
//       "Request Body:",
//       JSON.stringify(req.body),
//       "Response Body:",
//       JSON.stringify(res.locals.body),
//     ].join(" ");

//     winstonStream.write(logMessage);
//     return null; // Returning null because we are handling the logging manually
//   }),
// );

// Load routes with a service prefix
const customWildcardHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: "Custom Not Found" });
};

loadRoutes(routeFolder, app, "/api")
  .then(async () => {
    // Place wildcard route after all other routes
    app.use(customWildcardHandler);
    await postgresLoader();
    app.listen(port, () => {
      logger(`${getters.geti18ns().LOGS.RUNNING_APP} ${port}`);
      logger(`Running on - ${getters.getNodeEnv()}`);
    });
  })
  .catch((err) => console.error("Error loading routes:", err));
