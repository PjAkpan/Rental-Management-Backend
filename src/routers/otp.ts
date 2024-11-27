import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.otp.check().path]),
    method: constants.urls.otp.check().method,
    handlers: [controllers.otp.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.otp.createOtp().path]),
    method: constants.urls.otp.createOtp().method,
    handlers: [
      verifyMiddleware.validateCreateOtpRequest,
      controllers.otp.addOtp,
    ],
  },
  {
    path: joinUrls([constants.urls.otp.verifyOtp().path]), 
    method: constants.urls.otp.verifyOtp().method, 
    handlers: [
      verifyMiddleware.validateVerifyOtpRequest, 
      controllers.otp.verifyOtp,
    ],
  },
  {
    path: joinUrls([constants.urls.otp.resendOtp().path]),
    method: constants.urls.otp.resendOtp().method,
    handlers: [
      verifyMiddleware.validateResendOtpRequest, 
      controllers.otp.resendOtp, 
    ],
  },
  //  {
  //   path: joinUrls([constants.urls.otp.deleteOtp().path]),
  //   method: constants.urls.otp.deleteOtp().method,
  //   handlers: [controllers.otp.deleteOtp],
  // },
  //  {
  //   path: joinUrls([constants.urls.otp.modifyOtp().path]),
  //   method: constants.urls.otp.modifyOtp().method,
  //   handlers: [
  //     verifyMiddleware.updateOtpInputRequest,
  //     controllers.otp.modifyOtp,
  //   ],
  // },
  // {
  //   path: joinUrls([constants.urls.otp.viewSingleOtp().path]),
  //   method: constants.urls.otp.viewSingleOtp().method,
  //   handlers: [controllers.otp.fetchSingleInfo],
  // },
  // {
  //   path: joinUrls([constants.urls.otp.viewAllOtp().path]),
  //   method: constants.urls.otp.viewAllOtp().method,
  //   handlers: [
  //     verifyMiddleware.validateVeiwAllInput,
  //     controllers.otp.fetchAllOtps,
  //   ],
  // },
];

export default serviceLoader;
