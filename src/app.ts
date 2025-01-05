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
  setupNotificationsSocket,
} from "./middlewares";
import { logger } from "netwrap";
import path from "path";
import requestIp from "request-ip";
import fileUpload from "express-fileupload";
import { joinTables } from "./models";
const NODE_BUILD_ENV = process.env.NODE_BUILD_ENV || "development";
import { createServer } from "http";
import { Server } from "socket.io";

const app = express();

const server = createServer(app);
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
const socketIo: any = new Server(server, {
  cors: corsOptions,
});
// Example shared Map for userId-socketId mapping
const socketMapping = new Map();
app.set("socketMapping", socketMapping);

// Attach the socket instance to the app
app.set("io", socketIo);

// Use the socket notification middleware
setupNotificationsSocket(socketIo, socketMapping);

const routeFolder = path.resolve(__dirname, "./routers");
const port = getters.getAppPort();

// Middleware to capture response body
app.use(captureInflowANDOutput);

// Load routes with a service prefix
const customWildcardHandler = (req: Request, res: Response) => {
  res.status(404).json({ message: "Custom Not Found" });
};

loadRoutes(routeFolder, app, "/api", NODE_BUILD_ENV as string)
  .then(async () => {
    // Place wildcard route after all other routes
    app.use(customWildcardHandler);
    await postgresLoader();
    await joinTables.setupAssociations();
    server.listen(port, () => {
      logger(`${getters.geti18ns().LOGS.RUNNING_APP} ${port}`);
      logger(`Running on - ${getters.getNodeEnv()}`);
    });
  })
  .catch((err) => console.error("Error loading routes:", err));
