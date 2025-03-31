import { Socket } from "socket.io";

export const notificationHandler = (
  socketInstance: Socket,
  socketMapping: Map<string, string>,
) => {
  console.log("Client connected to Notifications", socketInstance.id);

  // Emit a welcome message
  socketInstance.emit(
    "notificationWelcome",
    "Welcome to the notification service!",
  );

  // Listen for a custom 'register' event to associate userId with socketId
  socketInstance.on("userLoggedIn", (data: { userId: string }) => {
    const { userId } = data;

    if (userId) {
      console.log(
        `Attempting to register user ${userId} with socketId ${socketInstance.id}`,
      );

      // Check if the socketId is already in use
      for (const [existingUserId, socketId] of socketMapping.entries()) {
        if (socketId === socketInstance.id) {
          console.warn(
            `SocketId ${socketInstance.id} is already associated with userId ${existingUserId}. Removing old association.`,
          );
          socketMapping.delete(existingUserId); // Remove old association
          break;
        }
      }

      // Register the new user with the socketId
      socketMapping.set(userId, socketInstance.id);

      // Convert Map to an array of objects for easy access
      const onlineUsers = Array.from(socketMapping.entries()).map(
        ([id, socketId]) => ({ userId: id, socketId }),
      );

      // Emit the updated list of online users
      socketInstance.emit("onlineUsers", onlineUsers);
    } else {
      console.error("Invalid userId format in userLoggedIn event");
    }
  });

  // Handle specific notification events
  socketInstance.on("subscribe", (topic: string) => {
    console.log(`Client subscribed to topic: ${topic}`);
    socketInstance.join(topic); // Add client to the topic's room
  });

  socketInstance.on("unsubscribe", (topic: string) => {
    console.log(`Client unsubscribed from topic: ${topic}`);
    socketInstance.leave(topic); // Remove client from the topic's room
  });

  // Handle disconnection and cleanup
  socketInstance.on("disconnect", (reason: any) => {
    console.log(`Socket disconnected: ${socketInstance.id}, reason: ${reason}`);
    // Find and remove the userId associated with this socketId
    for (const [userId, socketId] of socketMapping.entries()) {
      if (socketId === socketInstance.id) {
        socketMapping.delete(userId);
        break;
      }
    }
  });
};
