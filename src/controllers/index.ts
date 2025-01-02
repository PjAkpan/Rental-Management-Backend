import * as RentPaymentController from "./RentPayment";
import * as accountDetailsController from "./accountDetails";
import * as billsController from  "./bills";
import * as maintenanceController from "./maintenance";
import * as notificationController from "./notification";
import * as otpController from "./otp";
import * as resourcesController from "./resources";
import * as roomsController from "./rooms";
import * as usersController from "./users";
import healthControllers from "./health";

export default {
  RentPayment: RentPaymentController,
  accountDetails: accountDetailsController,
  bills: billsController,
  health: healthControllers,
  maintenance: maintenanceController,
  notification: notificationController,
  otp: otpController,
  resources: resourcesController,
  rooms: roomsController,
  users: usersController
};