import { Dialect } from "sequelize";
/* eslint-disable  @typescript-eslint/no-explicit-any */
export type DBconfigType = {
  dialect: Dialect | undefined;
  DB_INSTANTNAME: string;
  DB_CONNECTION: string;
  DB_HOST: string;
  DB_PORT: any;
  DB_DATABASE: string;
  DB_USERNAME: string;
  DB_PASSWORD: string;
  MYSQL_SSL: string;
  POOL_MAX: string;
  POOL_MIN: string;
  POOL_ACQUIRE: string;
  POOL_IDLE: any;
  OPERATOR_ALIASES: any;
  MONGOSEURL: string;
  ORACLECENNETIONSTRING: string;
  ORACLEHOST: string;
  ORACLEPORT: string;
  ORALCEDATABSENAME: string;
  ORALCEUSERNAME: string;
  ORACLEDIALECT: Dialect | undefined;
  ORACLEPASSWORD: string;
};


export type AppUrlsType = {
  backendPort: string | undefined;
  frontendUrl: string;
  backendUrl: string;
};

export type mailerType ={
   fromAddress: string | undefined;
  server: string | undefined;
  username: string | undefined;
  password: string | undefined;
}
