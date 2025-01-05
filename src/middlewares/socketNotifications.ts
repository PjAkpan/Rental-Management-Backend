import { notificationHandler } from "../services/socketHandlers";
import { Server } from "socket.io";

export const setupNotificationsSocket = (
  socketIo: Server,
  socketMapping: Map<any, any>,
) => {
  // Define namespaces and their respective handlers
  const namespaces = [
    { path: "/api/instantNotifications", handler: notificationHandler },
    // { path: "/api/anotherNamespace", handler: notificationHandler3 },
    // { path: "/api/thirdNamespace", handler: notificationHandler4 },
  ];

  // Dynamically initialize namespaces
  namespaces.forEach(({ path, handler }) => {
    const namespace = socketIo.of(path);

    namespace.on("connection", (socketInstance) => {
      console.log(`Client connected to namespace: ${path}`);
      handler(socketInstance, socketMapping); // Pass the handler and socketMapping
    });
  });
};
