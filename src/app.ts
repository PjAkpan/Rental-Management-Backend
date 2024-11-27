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
