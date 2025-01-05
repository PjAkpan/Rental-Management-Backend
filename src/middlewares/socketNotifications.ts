import { notificationHandler } from "../services/socketHandlers";
import { Server } from "socket.io";

export const setupNotificationsSocket = (socketIo: Server) => {
  //   // Chat namespace
  //   const chatNamespace = socketIo.of("/api/chat");
  //   chatNamespace.on("connection", chatHandler);

  // Notifications namespace
  const notificationsNamespace = socketIo.of("/api/instantNotifications");
  notificationsNamespace.on("connection", notificationHandler);

  //   // Order Tracking namespace
  //   const orderTrackingNamespace = socketIo.of("/api/orderTracking");
  //   orderTrackingNamespace.on("connection", orderTrackingHandler);
};
