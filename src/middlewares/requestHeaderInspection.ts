import { RequestHandler } from "express";

const requestHeaderInspection: RequestHandler = (req, res, next) => {
  const userAgent = req.get("User-Agent");
  if (!userAgent || userAgent.includes("badbot")) {
    return res.status(403).send("Forbidden");
  }
  next();
};

export default requestHeaderInspection;
