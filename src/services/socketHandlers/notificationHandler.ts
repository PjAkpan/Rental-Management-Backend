import { Socket } from "socket.io";
import { logger } from "netwrap"; // Assuming you have a logger
import { usersModel } from "../../models"; // Adjust path to your user model

 // types/errors.ts
export interface SafeError {
  message: string;
  code: string;
  statusCode: number;
  stack?: string;
  details?: unknown; // Better than 'any'
}

export type AppError = Error | SafeError;

// Type guard for Error
export function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Type guard for SafeError
export function isSafeError(error: unknown): error is SafeError {
  return typeof error === 'object' && error !== null && 
         'message' in error && typeof error.message === 'string' &&
         'code' in error && typeof error.code === 'string' &&
         'statusCode' in error && typeof error.statusCode === 'number';
}
interface UserSocketMap {
  userId: string;
  socketId: string;
  connectedAt: Date;
  lastActive: Date;
}

interface NotificationServiceOptions {
  socketMapping: Map<string, UserSocketMap>;
  userActivityTracking?: boolean;
  heartbeatInterval?: number;
}

export class NotificationService {
  private socketMapping: Map<string, UserSocketMap>;
  private userActivityTracking: boolean;
  private heartbeatInterval: number;
  private heartbeatIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor(options: NotificationServiceOptions) {
    this.socketMapping = options.socketMapping;
    this.userActivityTracking = options.userActivityTracking ?? true;
    this.heartbeatInterval = options.heartbeatInterval ?? 30000; // 30 seconds
  }

  public initializeSocketHandlers(socket: Socket) {
    logger(`Client connected to Notifications: ${socket.id}`);

    // Initialize connection
    this.handleConnection(socket);

    // Register event handlers
    this.handleAuthentication(socket);
    this.handleSubscription(socket);
    this.handleHeartbeat(socket);
    this.handleDisconnection(socket);
  }

  private handleConnection(socket: Socket) {
    // Welcome message with service info
    socket.emit("notification:connected", {
      message: "Connected to notification service",
      timestamp: new Date().toISOString(),
      features: {
        subscriptions: true,
        heartbeat: this.userActivityTracking,
        history: true,
      },
    });

    // Set up heartbeat if enabled
    if (this.userActivityTracking) {
      this.setupHeartbeat(socket);
    }
  }

  private handleAuthentication(socket: Socket) {
    socket.on(
      "user:authenticate",
      async (data: { userId: string; token?: string }, callback) => {
        try {
          // Validate input
          if (!data?.userId) {
            throw new Error("User ID is required");
          }

          // Verify user exists and is active (optional - remove if not needed)
          const user = await usersModel.findUsers({
            where: { id: data.userId, isActive: true, isDeleted: false },
            raw: true,
          });

          if (!user) {
            throw new Error("User not found or inactive");
          }

          // Register the user-socket association
          this.registerUserSocket(data.userId, socket);

          // Update user's active session in DB
          await this.updateUserSession(data.userId, socket.id, true);

          logger(`User ${data.userId} authenticated with socket ${socket.id}`);

          // Send success response
          callback({
            status: "success",
            userId: data.userId,
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          });
        } catch (error: unknown) {
          let errorMessage = "Authentication failed";

          if (isError(error)) {
            errorMessage = error.message;
            logger(
              `Authentication failed for socket ${socket.id}: ${error.stack || error.message}`,
            );
          } else if (isSafeError(error)) {
            errorMessage = error.message;
            logger(`Authentication failed with code ${error.code}: ${error}`);
          } else if (typeof error === "string") {
            errorMessage = error;
            logger(`Authentication failed: ${error}`);
          }

          callback({
            status: "error",
            message: errorMessage,
          });
        }
      },
    );
  }

  private handleSubscription(socket: Socket) {
    socket.on("notification:subscribe", (topic: string, callback) => {
      try {
        if (!topic) {
          throw new Error("Topic is required");
        }

        socket.join(topic);
        logger(`Socket ${socket.id} subscribed to topic: ${topic}`);

        callback({
          status: "success",
          topic,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        callback({
          status: "error",
          message:
            error instanceof Error ? error.message : "Subscription failed",
        });
      }
    });

    socket.on("notification:unsubscribe", (topic: string, callback) => {
      try {
        if (!topic) {
          throw new Error("Topic is required");
        }

        socket.leave(topic);
        logger(`Socket ${socket.id} unsubscribed from topic: ${topic}`);

        callback({
          status: "success",
          topic,
          timestamp: new Date().toISOString(),
        });
      } catch (error) {
        callback({
          status: "error",
          message:
            error instanceof Error ? error.message : "Unsubscription failed",
        });
      }
    });
  }

  private handleHeartbeat(socket: Socket) {
    if (!this.userActivityTracking) return;

    socket.on("notification:heartbeat", () => {
      const userEntry = this.findUserBySocketId(socket.id);
      if (userEntry) {
        userEntry.lastActive = new Date();
        logger(`Heartbeat received from user ${userEntry.userId}`);
      }
    });
  }

  private handleDisconnection(socket: Socket) {
    socket.on("disconnect", async (reason) => {
      logger(`Socket disconnected: ${socket.id}, reason: ${reason}`);

      // Clear heartbeat interval
      this.clearHeartbeat(socket.id);

      // Find and clean up user association
      const userEntry = this.findUserBySocketId(socket.id);
      if (userEntry) {
        this.socketMapping.delete(userEntry.userId);

        // Update user's session in DB (mark as disconnected)
        await this.updateUserSession(userEntry.userId, socket.id, false);

        logger(`Removed socket association for user ${userEntry.userId}`);
      }
    });
  }

  private registerUserSocket(userId: string, socket: Socket) {
    // Remove any existing association for this user
    if (this.socketMapping.has(userId)) {
      const oldSocketId = this.socketMapping.get(userId)!.socketId;
      logger(
        `Replacing existing socket ${oldSocketId} for user ${userId}`,
      );
    }

    // Remove any existing association for this socket
    this.findAndRemoveSocket(socket.id);

    // Create new association
    this.socketMapping.set(userId, {
      userId,
      socketId: socket.id,
      connectedAt: new Date(),
      lastActive: new Date(),
    });

    logger(`Registered new socket ${socket.id} for user ${userId}`);
  }

  private async updateUserSession(
    userId: string,
    socketId: string,
    isConnected: boolean,
  ) {
    try {
        const user:any = await usersModel.findUsersById(userId);

        if (!user.payload) {
          throw new Error("User not found");
        }
      // 2. Get existing activeSession or initialize empty array
      const currentSessions = user.payload.activeSession || [];

      // 3. Update or add socket information
      const updatedSessions = currentSessions.map((session: any) => ({
        ...session, // Keep all existing properties
        ...(isConnected && {
          socketId,
          lastActive: new Date(),
        }),
      }));

      // If no sessions existed, create a new one with socket info
      if (updatedSessions.length === 0 && isConnected) {
        updatedSessions.push({
          socketId,
          lastActive: new Date(),
        });
      }

      // 4. Update the user record
      await usersModel.updateUsersById(userId, {
        activeSession: isConnected ? updatedSessions : [],
      });
    } catch (error) {
      logger(`Failed to update user session for ${userId}: -- ${error}`);
    }
  }

  private findUserBySocketId(socketId: string): UserSocketMap | undefined {
    for (const entry of this.socketMapping.values()) {
      if (entry.socketId === socketId) {
        return entry;
      }
    }
    return undefined;
  }

  private findAndRemoveSocket(socketId: string) {
    for (const [userId, entry] of this.socketMapping.entries()) {
      if (entry.socketId === socketId) {
        this.socketMapping.delete(userId);
        return true;
      }
    }
    return false;
  }

  private setupHeartbeat(socket: Socket) {
    const interval = setInterval(() => {
      const userEntry = this.findUserBySocketId(socket.id);
      if (userEntry) {
        const inactiveDuration = Date.now() - userEntry.lastActive.getTime();
        if (inactiveDuration > this.heartbeatInterval * 2) {
          logger(
            `Terminating inactive socket ${socket.id} for user ${userEntry.userId}`,
          );
          socket.disconnect(true);
        }
      }
    }, this.heartbeatInterval);

    this.heartbeatIntervals.set(socket.id, interval);
  }

  private clearHeartbeat(socketId: string) {
    const interval = this.heartbeatIntervals.get(socketId);
    if (interval) {
      clearInterval(interval);
      this.heartbeatIntervals.delete(socketId);
    }
  }

  // Public API for sending notifications
  public async sendToUser(userId: string, event: string, data: any) {
    const userEntry = this.socketMapping.get(userId);
    if (userEntry) {
      const socket = this.getSocketById(userEntry.socketId);
      if (socket) {
        socket.emit(event, data);
        return true;
      }
    }
    return false;
  }

  // Method to get all active users
  public getActiveUsers(): UserSocketMap[] {
    return Array.from(this.socketMapping.values());
  }

  // Method to get socket by ID (implementation depends on your Socket.IO setup)
  private getSocketById(socketId: string): Socket | null {
    // This needs to be implemented based on how you access sockets in your app
    // For example, if you have access to io instance:
    // return io.sockets.sockets.get(socketId) || null;
    return null; // Placeholder
  }
}




// // Initialize the service
// const socketMapping = new Map<string, UserSocketMap>();
// const notificationService = new NotificationService({
//   socketMapping,
//   userActivityTracking: true
// });

// // In your Socket.IO connection handler
// io.on('connection', (socket) => {
//   notificationService.initializeSocketHandlers(socket);
// });

// // Elsewhere in your application
// notificationService.sendToUser('user123', 'notification:new', {
//   message: 'You have a new notification',
//   type: 'alert'
// });