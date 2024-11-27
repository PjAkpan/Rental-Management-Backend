/* eslint-disable @typescript-eslint/no-explicit-any */
import { AppUrlsType, DBconfigType, Env } from "@types";
import dotenv from "dotenv";
import { Dialect } from "sequelize";

dotenv.config();

const databasesUrls: Record<Env["NODE_ENV"], DBconfigType> = {
  production: {
    dialect: process.env.PRODUCTION_dialect as Dialect,
    DB_CONNECTION: process.env.PRODUCTION_DB_CONNECTION!,
    DB_HOST: process.env.PRODUCTION_DB_HOST!,
    DB_PORT: process.env.PRODUCTION_DB_PORT!,
    DB_DATABASE: process.env.PRODUCTION_DB_DATABASE!,
    DB_USERNAME: process.env.PRODUCTION_DB_USERNAME!,
    DB_PASSWORD: process.env.PRODUCTION_DB_PASSWORD!,
    MYSQL_SSL: process.env.PRODUCTION_MYSQL_SSL!,
    POOL_MAX: process.env.POOL_MAX || "5",
    POOL_MIN: process.env.POOL_MIN || "0",
    POOL_ACQUIRE: process.env.POOL_ACQUIRE || "30000",
    POOL_IDLE: process.env.POOL_IDLE || "10000",
    OPERATOR_ALIASES: process.env.OPERATOR_ALIASES!,
    MONGOSEURL: process.env.DB_PROD!,
    DB_INSTANTNAME: process.env.PRODUCTION_DB_INSTANTNAME!,
    ORACLECENNETIONSTRING: process.env.PRODUCTION_BANKS_DB_CONNECTION_STRING!,
    ORACLEHOST: process.env.PRODUCTION_DB_ORACLE_HOST!,
    ORACLEPORT: process.env.PRODUCTION_DB_ORACLE_PORT!,
    ORALCEDATABSENAME: process.env.PRODUCTION_DB_ORACLE_DATABASE!,
    ORALCEUSERNAME: process.env.PRODUCTION_DB_ORACLE_USERNAME!,
    ORACLEDIALECT: process.env.PRODUCTION_ORACLEdialect as Dialect,
    ORACLEPASSWORD: process.env.PRODUCTION_DB_ORACLE_PASSWORD!,
  },
  staging: {
    dialect: process.env.STAGING_dialect as Dialect,
    DB_CONNECTION: process.env.STAGING_DB_CONNECTION!,
    DB_HOST: process.env.STAGING_DB_HOST!,
    DB_PORT: process.env.STAGING_DB_PORT!,
    DB_DATABASE: process.env.STAGING_DB_DATABASE!,
    DB_USERNAME: process.env.STAGING_DB_USERNAME!,
    DB_PASSWORD: process.env.STAGING_DB_PASSWORD!,
    MYSQL_SSL: process.env.STAGING_MYSQL_SSL!,
    POOL_MAX: process.env.POOL_MAX || "5",
    POOL_MIN: process.env.POOL_MIN || "0",
    POOL_ACQUIRE: process.env.POOL_ACQUIRE || "30000",
    POOL_IDLE: process.env.POOL_IDLE || 10000,
    OPERATOR_ALIASES: process.env.OPERATOR_ALIASES || "false",
    MONGOSEURL: process.env.DB_STAGING!,
    DB_INSTANTNAME: process.env.STAGING_DB_INSTANTNAME!,
    ORACLECENNETIONSTRING: process.env.STAGING_BANKS_DB_CONNECTION_STRING!,
    ORACLEHOST: process.env.STAGING_DB_ORACLE_HOST!,
    ORACLEPORT: process.env.STAGING_DB_ORACLE_PORT!,
    ORALCEDATABSENAME: process.env.STAGING_DB_ORACLE_DATABASE!,
    ORALCEUSERNAME: process.env.STAGING_DB_ORACLE_USERNAME!,
    ORACLEDIALECT: process.env.STAGING_ORACLEdialect as Dialect,
    ORACLEPASSWORD: process.env.STAGING_DB_ORACLE_PASSWORD!,
  },
  development: {
    dialect: undefined,
    DB_INSTANTNAME: "",
    DB_CONNECTION: "",
    DB_HOST: "",
    DB_PORT: "",
    DB_DATABASE: "",
    DB_USERNAME: "",
    DB_PASSWORD: "",
    MYSQL_SSL: "",
    POOL_MAX: "",
    POOL_MIN: "",
    POOL_ACQUIRE: "",
    POOL_IDLE: "",
    OPERATOR_ALIASES: "",
    MONGOSEURL: "",
    ORACLECENNETIONSTRING: "",
    ORACLEHOST: "",
    ORACLEPORT: "",
    ORALCEDATABSENAME: "",
    ORALCEUSERNAME: "",
    ORACLEDIALECT: undefined,
    ORACLEPASSWORD: "",
  },
};

const frontendUrls = (port: number) => ({
  production: "https://loudinsight.com",
  development: `http://localhost:${port}`,
  staging: "https://staging.loudinsight.top",
});

const backendUrls = (port: number, urlFilter = "") => ({
  production: `https://loudinsight.com/api/${urlFilter}`,
  development: `http://localhost:${port}/api/${urlFilter}`,
  staging: `https://staging.loudinsight.top/api/${urlFilter}`,
});

const appUrls: AppUrlsType = {
  backendPort: process.env.APP_PORT,
  frontendUrl: frontendUrls(process.env.APP_PORT as any)[
    process.env.NODE_ENV as Env["NODE_ENV"]
  ],
  backendUrl: backendUrls(process.env.APP_PORT as any)[
    process.env.NODE_ENV as Env["NODE_ENV"]
  ],
};

const isStaging = process.env.NODE_ENV;
// Define the appropriate environment prefix
const envPrefix = isStaging == "staging" ? "STAGING_" : "PRODUCTION_";

export const env: Env & {
  databasesUrls: typeof databasesUrls;
  appUrls: AppUrlsType;
} = {
  NODE_ENV: process.env.NODE_ENV as Env["NODE_ENV"],
  CURRENT_LANGUAGE: process.env.CURRENT_LANGUAGE as Env["CURRENT_LANGUAGE"],
  APP_PORT: process.env.APP_PORT!,
  DATABASE_URI: process.env.DATABASE_URI!,
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET!,
  verificationTokenSecret: process.env.VERIFICATION_TOKEN_SECRET!,
  expireTime: process.env.EXPIRES_IN!,
  databasesUrls,
  paystackBaseUrl: process.env[`${envPrefix}PAYSTACK_BASE_URL`]!,
  paystackAccessKey: process.env[`${envPrefix}PAYSTACK_TOKEN_SECRET`]!,
  INITVECTOR: process.env[`${envPrefix}INITVECTOR`]!,
  SECURITYKEY: process.env[`${envPrefix}SECURITYKEY`]!,
  appUrls,
  fromAddress: process.env[`${envPrefix}EMAIL_FROM_ADDR`]!,
  server: process.env[`${envPrefix}EMAIL_SERVER`]!,
  username: process.env[`${envPrefix}EMAIL_USERNAME`]!,
  password: process.env[`${envPrefix}EMAIL_PASSWORD`]!,
  all: process.env[`${envPrefix}EMAIL_RECIPIENTS`]!,
};
