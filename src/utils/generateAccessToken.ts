import jwt from "jsonwebtoken";
import { getters } from "../config";

export const generateAccessToken = (data: object, type: string) => {
  const secret =
    type === "vtoken" ?
      getters.getAppSecrets().verificationTokenSecret :
      getters.getAppSecrets().accessTokenSecret;

  return Promise.resolve(
    jwt.sign({ ...data }, secret, {
      expiresIn: getters.getAppSecrets().expireTime,
    }),
  );
};
