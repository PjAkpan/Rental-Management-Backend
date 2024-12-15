import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.RentPayment.check().path]),
    method: constants.urls.RentPayment.check().method,
    handlers: [controllers.RentPayment.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.RentPayment.createRentPayment().path]),
    method: constants.urls.RentPayment.createRentPayment().method,
    handlers: [
      verifyMiddleware.validateCreateRentPaymentRequest,
      controllers.RentPayment.addRentPayment,
    ],
  },
  {
    path: joinUrls([constants.urls.RentPayment.createTenancyPayment().path]),
    method: constants.urls.RentPayment.createTenancyPayment().method,
    handlers: [
      verifyMiddleware.validateCreateTenancyPaymentRequest,
      controllers.RentPayment.addTenancyPayment,
    ],
  },
  {
    path: joinUrls([constants.urls.RentPayment.deleteRentPayment().path]),
    method: constants.urls.RentPayment.deleteRentPayment().method,
    handlers: [controllers.RentPayment.deleteRentPayment],
  },
  {
    path: joinUrls([constants.urls.RentPayment.modifyRentPayment().path]),
    method: constants.urls.RentPayment.modifyRentPayment().method,
    handlers: [
      verifyMiddleware.updateRentPaymentInputRequest,
      controllers.RentPayment.modifyRentPayment,
    ],
  },
  {
    path: joinUrls([constants.urls.RentPayment.viewSingleRentPayment().path]),
    method: constants.urls.RentPayment.viewSingleRentPayment().method,
    handlers: [controllers.RentPayment.fetchSingleInfo],
  },
  {
    path: joinUrls([constants.urls.RentPayment.viewAllRentPayment().path]),
    method: constants.urls.RentPayment.viewAllRentPayment().method,
    handlers: [
      verifyMiddleware.validateVeiwAllInput,
      controllers.RentPayment.fetchAllRentPayments,
    ],
  },
  {
    path: joinUrls([constants.urls.RentPayment.viewAllTenancyPayment().path]),
    method: constants.urls.RentPayment.viewAllTenancyPayment().method,
    handlers: [
      verifyMiddleware.validateVeiwAllInput,
      controllers.RentPayment.fetchAllTenancyPayments,
    ],
  },
];

export default serviceLoader;
