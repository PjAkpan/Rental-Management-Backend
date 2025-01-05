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
  socketInstance.on("userLoggedIn", (userId: any) => {
    const userIds = userId.userId;
    console.log(
      `Registering user ${userIds} with socketId ${socketInstance.id}`,
    );
    socketMapping.set(userIds, socketInstance.id);
    socketInstance.emit("onlineUsers", { ...socketMapping });
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
