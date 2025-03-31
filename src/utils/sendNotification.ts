// import { getSocketIdsByUserIds, getUserIdsByRole } from "../models/users";
// import { Server, Socket } from "socket.io";


// export const sendNotification = async ({
//   io,
//   namespace,
//   eventType,
//   requestType,
//   message,
//   role,
//   userIds,
// }: {
//   io: Server;
//   namespace: string; // e.g., "/admin" or "/clientUsers"
//   eventType: string; // e.g., "notification"
//   requestType: "all" | "role" | "specific"; // Type of notification
//   message: string; // Notification message
//   role?: string; // Role, e.g., "admin", "clientUser" (if sending to roles)
//   userIds?: string[]; // Specific user IDs (if sending to specific users)
// }) => {
//   try {
//     const ns = io.of(namespace); // Get namespace instance
//     let targetSocketIds: string[] = [];

//     if (requestType === "all") {
//       // Send to all connected clients in the namespace
//       ns.emit(eventType, { message });
//       console.log(`Broadcasted to all users in namespace: ${namespace}`);
//     } else if (requestType === "role" && role) {
//       // Fetch user IDs by role
//       const userIds = await getUserIdsByRole(role); // Simulated DB call
//       targetSocketIds = await getSocketIdsByUserIds(userIds); // Map to socket IDs

//       targetSocketIds.forEach((socketId) => {
//         ns.to(socketId).emit(eventType, { message });
//       });
//       console.log(
//         `Sent notification to role: ${role}, users: ${userIds.join(", ")}`,
//       );
//     } else if (requestType === "specific" && userIds) {
//       // Fetch socket IDs for specific user IDs
//       targetSocketIds = await getSocketIdsByUserIds(userIds);

//       targetSocketIds.forEach((socketId) => {
//         ns.to(socketId).emit(eventType, { message });
//       });
//       console.log(`Sent notification to users: ${userIds.join(", ")}`);
//     } else {
//       console.error("Invalid requestType or missing parameters");
//     }
//   } catch (error) {
//     console.error("Error sending notification:", error);
//   }
// };


export const sendNotification ={  };