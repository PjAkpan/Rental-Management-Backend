import { connect, connection } from "mongoose";
import { getters } from "./getters";
import { logger } from "netwrap";

const connectDB = async (DB_URI: string) => {
  logger("Connecting to database...", {
    shouldLog: false,
    isError: false,
  });

  try {
    await connect(DB_URI);
    logger("Database connection successful", {
      shouldLog: false,
      isError: false,
    });
  } catch (err) {
    logger("Unable to connect to database", {
      shouldLog: false,
      isError: true,
    });
    logger(err);
  } finally {
    connection.on("error", (error: Error) => {
      logger(`${error} - DB connection Error Status`, {
        shouldLog: true,
        isError: true,
      });
    });
  }
};

export const mongooseLoader = async () =>
  await connectDB(getters.getDatabaseUri());
