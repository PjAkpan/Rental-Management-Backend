import { constants } from "../constants";
import { env } from "./dynamicEnv";
import { Env } from "../types";

const getCurrentLanguage = () => {
  if (!env.CURRENT_LANGUAGE) {
    return constants.defaults.currentLanguage as typeof env.CURRENT_LANGUAGE;
  }

  return env.CURRENT_LANGUAGE;
};

const geti18ns = () => {
  return constants.i18n[getCurrentLanguage()];
};

const getNodeEnv = () => {
  if (!env.NODE_ENV) {
    return constants.defaults.environment as typeof env.NODE_ENV;
  }

  return env.NODE_ENV;
};

const getAppPort = () => {
  if (!env.APP_PORT) {
    return constants.defaults.appPort;
  }

  return parseInt(env.APP_PORT);
};

// export const getDatabaseUri = () => ({
//   url: env.DATABASE_URI,
// });

const getDatabaseUri = () => {
  return env.DATABASE_URI;
};

const getAppSecrets = () => ({
  accessTokenSecret: env.accessTokenSecret,
  verificationTokenSecret: env.verificationTokenSecret,
  expireTime: env.expireTime,
  appInV: env.INITVECTOR,
  appInSec: env.SECURITYKEY,
});

const getDatabaseUrl = () => ({
  url: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].MONGOSEURL,
  DBcon: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].DB_CONNECTION,
  DIALECT: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].dialect,
  HOST: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].DB_HOST,
  PORT: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].DB_PORT,
  DB: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].DB_DATABASE,
  USER: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].DB_USERNAME,
  PASSWORD: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].DB_PASSWORD,
  MYSQL_SSL: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].MYSQL_SSL,
  MAX: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].POOL_MAX,
  MIN: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].POOL_MIN,
  ACQUIRE: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].POOL_ACQUIRE,
  IDLE: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].POOL_IDLE,
  ALIASES: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].OPERATOR_ALIASES,
  instantName:
    env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].DB_INSTANTNAME,
  oracleConnectionstring:
    env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].ORACLECENNETIONSTRING,
  oracleHost: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].ORACLEHOST,
  oraclePort: env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].ORACLEPORT,
  oracleDBname:
    env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].ORALCEDATABSENAME,
  oracleUsername:
    env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].ORALCEUSERNAME,
  oraclePassword:
    env.databasesUrls[env.NODE_ENV as Env["NODE_ENV"]].ORACLEPASSWORD,
});

const getPayStackInfo = () => ({
  url: env.paystackBaseUrl,
  key: env.paystackAccessKey,
});

const getAppUrls = () => ({
  ...env.appUrls,
});

const getAppMailers = () => ({
  fromAddress: env.fromAddress,
  server: env.server,
  username: env.username,
  password: env.password,
});

const getDefaultMails = () => ({
  all: env.all,
});

export const getters = {
  geti18ns,
  getCurrentLanguage,
  getNodeEnv,
  getAppPort,
  getDatabaseUri,
  getAppSecrets,
  getDatabaseUrl,
  getPayStackInfo,
  getAppUrls,
  getAppMailers,
  getDefaultMails,
};
