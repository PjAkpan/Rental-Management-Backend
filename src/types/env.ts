export type Env = {
  NODE_ENV: "production" | "staging" | "development";
  CURRENT_LANGUAGE: "en";
  APP_PORT: string;
  DATABASE_URI: string;
  accessTokenSecret: string;
  verificationTokenSecret: string;
  expireTime: string;
  paystackBaseUrl: string;
  paystackAccessKey: string;
  INITVECTOR: string;
  SECURITYKEY: string;
  password: string;
  username: string;
  server: string;
  fromAddress: string;
  all: string;
};
