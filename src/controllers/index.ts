import * as RentPaymentController from "./RentPayment";
import * as billsController from  "./bills";
import * as maintenanceController from "./maintenance";
import * as otpController from "./otp";
import * as resourcesController from "./resources";
import * as usersController from "./users";
import healthControllers from "./health";

export default {
  RentPayment: RentPaymentController,
  bills: billsController,
  health: healthControllers,
  maintenance: maintenanceController,
  otp: otpController,
  resources: resourcesController,
  users: usersController
};