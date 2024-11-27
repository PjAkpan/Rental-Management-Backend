// import { connect, connection } from "mongoose";

import { Sequelize } from "sequelize";
import { logger } from "netwrap";
import { getters } from "./getters";

// server connection settings

export const MysqlSequelizeInstance = new Sequelize(
  getters.getDatabaseUrl().DB,
  getters.getDatabaseUrl().USER,
  getters.getDatabaseUrl().PASSWORD,
  {
    host: getters.getDatabaseUrl().HOST,
    port: getters.getDatabaseUrl().PORT,
    dialect: "mysql", // Specify the dialect directly as 'mysql'
    dialectOptions: {
      connectTimeout: 60000, // Increase connection timeout if needed
    },
    pool: {
      max: 5,
      min: 1,
      acquire: 60000,
      idle: getters.getDatabaseUrl().IDLE,
    },
    define: {
      timestamps: true,
      freezeTableName: true,
    },
    /* eslint-disable  no-console */
    logging: console.log, // You can keep this for logging if needed
  },
);

// console.log(MysqlSequelizeInstance)
export const MssqlSequelizeInstance = new Sequelize(
  getters.getDatabaseUrl().DB,
  getters.getDatabaseUrl().USER,
  getters.getDatabaseUrl().PASSWORD,
  {
    host: getters.getDatabaseUrl().HOST,
    port: getters.getDatabaseUrl().PORT,
    dialect: getters.getDatabaseUrl().DIALECT,
    operatorsAliases: getters.getDatabaseUrl().ALIASES,
    dialectOptions: {
      options: {
        encrypt: false,
        enableArithAbort: false,
      },
      instanceName: getters.getDatabaseUrl().instantName,
      // "ssl": {
      //   "require":getDatabaseUrl().dialectOptions.ssl,
      //   "rejectUnauthorized":getDatabaseUrl().dialectOptions.native
      // }
    },
    pool: {
      max: 5,
      min: 1,
      acquire: 60000,
      idle: getters.getDatabaseUrl().IDLE,
    },
    define: {
      timestamps: true,
      freezeTableName: true,
    },
    /* eslint-disable  no-console */
    logging: console.log,
  },
);

export const PostgresSequelizeInstance = new Sequelize(
  getters.getDatabaseUrl().HOST,
  {
    dialect: "postgres", // Specify the dialect directly as 'postgres'
    dialectOptions: {
      ssl: {
        require: true, // Require SSL
        rejectUnauthorized: false,
      },
      connectTimeout: 60000, // Increase connection timeout if needed
    },
    pool: {
      max: 5,
      min: 1,
      acquire: 60000,
      idle: getters.getDatabaseUrl().IDLE,
    },
    define: {
      timestamps: true,
      freezeTableName: true,
    },
    /* eslint-disable  no-console */
    logging: console.log, // You can keep this for logging if needed
  },
);

// export const ORACLESequelizeInstance = new Sequelize(
//  getters.getDatabaseUrl().oracleDBname,
//  getters.getDatabaseUrl().oracleUsername,
//  getters.getDatabaseUrl().oraclePassword,
//   {
//     host:getters.getDatabaseUrl().oracleHost,
//     port:getters.getDatabaseUrl().oraclePort,
//     dialect:getters.getDatabaseUrl().oracleDialect,
//     pool: {
//       max: 5,
//       min: 1,
//       acquire: 60000,
//       idle:getters.getDatabaseUrl().IDLE
//     },
//     logging: console.log,
//     query: {
//       raw: true
//     }
//   });
// console.log(PostgresSequelizeInstance)

const connectDB = async (
  sequelizeInstance: Sequelize,
  dbType: string,
  retries = 15000,
) => {
  logger(`Connecting to ${dbType} database....`, {
    shouldLog: true,
    isError: false,
  });
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const checkInstanceConnection = await sequelizeInstance.authenticate();
      logger(
        `Database connection successful 
        ${dbType} ---- ${checkInstanceConnection}`,
        {
          shouldLog: true,
          isError: false,
        },
      );
      return;
    } catch (err) {
      logger(
        `Attempt ${attempt} -
         Unable to connect to ${dbType} database`,
        {
          shouldLog: true,
          isError: true,
        },
      );
      logger((err as Error).message || String(err));

      // If last attempt, throw error
      if (attempt === retries) {
        throw new Error(
          `Failed to connect to ${dbType} 
          database after ${retries} attempts`,
        );
      }

      // Wait before retrying
      await new Promise((res) => setTimeout(res, 2000));
    }
  }
};

export const mssqlLoader = async () =>
  await connectDB(MssqlSequelizeInstance, "MSSQL DB");
export const mysqlLoader = async () =>
  await connectDB(MysqlSequelizeInstance, "MYSQL DB");
export const postgresLoader = async () =>
  await connectDB(PostgresSequelizeInstance, "PostgreSQL DB");

export const DBconnect = PostgresSequelizeInstance;
