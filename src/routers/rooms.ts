import { constants } from "../constants";
import { RouteHandler } from "src/types/route";
import { joinUrls } from "../utils";
import controllers from "../controllers";
import { verifyMiddleware } from "../middlewares";

const serviceLoader: RouteHandler[] = [
  {
    path: joinUrls([constants.urls.rooms.check().path]),
    method: constants.urls.rooms.check().method,
    handlers: [controllers.rooms.checkServiceHealth],
  },
  {
    path: joinUrls([constants.urls.rooms.createRooms().path]),
    method: constants.urls.rooms.createRooms().method,
    handlers: [verifyMiddleware.validateCreateRoomsRequest, controllers.rooms.addRooms],
  },
  {
    path: joinUrls([constants.urls.rooms.deleteRooms().path]),
    method: constants.urls.rooms.deleteRooms().method,
    handlers: [controllers.rooms.deleteRooms],
  },
  {
    path: joinUrls([constants.urls.rooms.modifyRooms().path]),
    method: constants.urls.rooms.modifyRooms().method,
    handlers: [
      verifyMiddleware.updateRoomsInputRequest,
      controllers.rooms.modifyRooms,
    ],
  },
  {
    path: joinUrls([constants.urls.rooms.viewSingleRooms().path]),
    method: constants.urls.rooms.viewSingleRooms().method,
    handlers: [controllers.rooms.fetchSingleInfo],
  },
  {
    path: joinUrls([constants.urls.rooms.viewAllRooms().path]),
    method: constants.urls.rooms.viewAllRooms().method,
    handlers: [
      verifyMiddleware.validateVeiwAllInput,
      controllers.rooms.fetchAllRoomss,
    ],
  },

];

export default serviceLoader;
