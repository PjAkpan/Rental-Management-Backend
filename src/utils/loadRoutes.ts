import fs from "fs";
import path from "path";
import { Express, Request, Response, NextFunction } from "express";
import { RouteHandler } from "../types";
import { logger } from "netwrap";

/**
 * Loads route files from a folder and applies them to the Express app with a specified prefix.
 */
export default async function loadRoutes(
  routeFolderName: string,
  app: Express,
  servicePrefix = "",
  wildcardHandler?: (req: Request, res: Response, next: NextFunction) => void
): Promise<void> {
  const startTime = Date.now();
  const isDevelopment = process.env.NODE_BUILD_ENV === "development";
  logger("Netwrap Log: Available Routes below");

  try {
    const routeFiles = fs.readdirSync(routeFolderName);

    for (const file of routeFiles) {
      if (
        (!file.endsWith(".js") && !file.endsWith(".ts")) ||
        file === "index.ts" ||
        file.endsWith(".d.ts")
      )
        continue;

      const filePath = path.join(routeFolderName, file);
      const modulePrefix = path.basename(file, path.extname(file)); // Get filename without extension

      let routes: RouteHandler[] = [];
      try {
        const requirePath = isDevelopment
          ? filePath
          : filePath.replace(".ts", ".js");

        routes = require(requirePath).default;
      } catch (error) {
        logger(
          `Failed to load route file ${file}: ${(error as Error).message}`
        );
        continue;
      }

      if (!Array.isArray(routes)) {
        logger(
          `Invalid route configuration in ${file}. Expected an array of routes.`
        );
        continue;
      }

      routes.forEach((route) => {
        const { path, method, handlers } = route;
        const fullPath = `${servicePrefix}/${modulePrefix}${path}`;

        app[method](fullPath, ...handlers);

        logger(
          `${fullPath} - ${
            method.charAt(0).toUpperCase() + method.slice(1).toLowerCase()
          }`
        );
      });
    }

    if (wildcardHandler) {
      app.use(wildcardHandler);
    } else {
      app.use((req: Request, res: Response) => {
        res.status(404).json({ message: "Not Found" });
      });
    }

    const duration = (Date.now() - startTime).toFixed(3);
    logger(`Loaded routes in - ${duration}ms`);
  } catch (error) {
    logger(`Failed to load route: ${(error as Error).message}`);
  }
}
