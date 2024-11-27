import * as otpController from "./otp";
import * as resourcesController from "./resources";
import * as usersController from "./users";
import * as billsController from  "./bills";
import healthControllers from "./health";

export default {
  health: healthControllers,
  otp: otpController,
  resources: resourcesController,
  users: usersController,
  bills: billsController
};
