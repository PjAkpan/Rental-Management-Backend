import { Socket } from "socket.io";

export const notificationHandler = (socketInstance: Socket) => {
  console.log("Client connected to Notifications", socketInstance);

  // Emit a welcome message
  socketInstance.emit(
    "notificationWelcome",
    "Welcome to the notification service!",
  );

  // Handle specific notification events
  socketInstance.on("subscribe", (topic: string) => {
    console.log(`Client subscribed to topic: ${topic}`);
    socketInstance.join(topic); // Add client to the topic's room
  });

  socketInstance.on("unsubscribe", (topic: string) => {
    console.log(`Client unsubscribed from topic: ${topic}`);
    socketInstance.leave(topic); // Remove client from the topic's room
  });

  socketInstance.on("disconnect", (reason: any) => {
    console.log("Notification client disconnected:", reason);
    socketInstance.emit("signOut", `Client disconnected: ${reason}`);
  });
};
