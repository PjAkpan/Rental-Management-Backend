import express, { Request, Response } from "express";
import bodyParser from "body-parser";
import cors from "cors";
import { getters, postgresLoader } from "./config";
import loadRoutes from "./utils/loadRoutes";
import helmet from "helmet";
import {
  captureInflowANDOutput,
  forbiddenPaths,
  requestHeaderInspection,
} from "./middlewares";
import { logger } from "netwrap";
import path from "path";
import requestIp from "request-ip";
import fileUpload from "express-fileupload";
import { joinTables } from "./models";

const app = express();

const corsOptions = {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
};

app.use(cors(corsOptions));

// Parse application/json requests
app.use(express.json({ limit: "1000mb" }));
// Register the requestIp middleware
app.use(requestIp.mw());
// Parse application/x-www-form-urlencoded requests
app.use(express.urlencoded({ limit: "1000mb", extended: true }));
// Parse text/plain requests
app.use(bodyParser.text());

app.use(helmet());

app.use("*", forbiddenPaths);

app.use(requestHeaderInspection);
// enable files upload
app.use(
  fileUpload({
    createParentPath: true,
  }),
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

const routeFolder = path.resolve(__dirname, "./routers");
const port = getters.getAppPort();

// Middleware to capture response body
app.use(captureInflowANDOutput);
// Load routes with a service prefix
const customWildcardHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: "Custom Not Found" });
};

loadRoutes(routeFolder, app, "/api")
  .then(async () => {
    // Place wildcard route after all other routes
    app.use(customWildcardHandler);
    await postgresLoader();
    await joinTables.setupAssociations();
    app.listen(port, () => {
      logger(`${getters.geti18ns().LOGS.RUNNING_APP} ${port}`);
      logger(`Running on - ${getters.getNodeEnv()}`);
    });
  })
  .catch((err) => console.error("Error loading routes:", err));
