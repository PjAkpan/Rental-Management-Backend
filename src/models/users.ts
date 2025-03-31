/* eslint-disable @typescript-eslint/no-unused-vars */
import { DataTypes, Sequelize } from "sequelize";
import { usersShemType } from "./types";
import { DBconnect, HttpStatusCode } from "../config";
import { logger } from "netwrap";
import { UserProfileModel } from "./userProfile";

const UsersSchema = DBconnect.define(
  "tblUsers",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      allowNull: false,
      primaryKey: true,
    },

    deviceId: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    role: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true, // Assuming emails should be unique
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    ipAddress: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: true, // Optional
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    isDeleted: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
    },
    activeSession: {
      type: DataTypes.JSON, // Stores session data as JSON
      allowNull: true,
    },
  },
  {
    tableName: "tblUsers",
    timestamps: true,
    freezeTableName: true,
  },
);

//UsersSchema.sync({ force: true });

export const UsersModel = UsersSchema;

// Create a new Users entry
export const saveUsers = async (data: Record<string, unknown>) => {
  try {
    const newUsers = (await UsersModel.create(data)) as usersShemType;
    return {
      status: true,
      statusCode: HttpStatusCode.Created,
      message: "Users created successfully",
      payload: newUsers,
    };
  } catch (err) {
    console.log(err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error creating Users",
      payload: null,
    };
  }
};

// Find a Users by any filter
export const findUsers = async (filter: Record<string, unknown>) => {
  try {
    filter.raw = true;
    const Users = await UsersModel.findOne(filter);
    if (!Users) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Users not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "User already exist",
      payload: Users as usersShemType,
    };
  } catch (err) {
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Users",
      payload: null,
    };
  }
};

// Find all Userss
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const findAll = async (filter: any) => {
  try {
    const [allRecords, recordCount] = await Promise.all([
      UsersModel.findAll({
        ...filter,
        attributes: { exclude: ["deviceId", "password", "activeSession"] },
        include: [
          {
            model: UserProfileModel,
            as: "userInfo",
            attributes: [
              "profileId",
              "roomNumber",
              "profileImage",
              "email",
              "fullName",
              "phoneNumber",
            ],
            on: Sequelize.literal(
              "\"tblUsers\".\"id\" = \"userInfo\".\"profileId\"::uuid",
            ),
          },
        ],
      }),
      UsersModel.count({
        where: filter.where,
      }),
    ]);
    if (!allRecords || allRecords.length === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Users not found",
        payload: null,
      };
    }

    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Userss retrieved successfully",
      payload: { allRecords, recordCount },
    };
  } catch (err) {
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: `Error retrieving Users ${(err as Error).message}`,
      error: (err as Error).message || "Error retrieving Userss",
    };
  }
};

// Find a Users by ID
export const findUsersById = async (id: string) => {
  try {
    const Users = await UsersModel.findByPk(id);
    if (!Users) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Users not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Users found",
      payload: Users,
    };
  } catch (err) {
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error finding Users",
      payload: null,
    };
  }
};

// Update a Users by ID
export const updateUsersById = async (
  id: string | undefined,
  updateData: Partial<usersShemType>,
) => {
  try {
    const [rowsUpdated, [updatedUsers]] = await UsersModel.update(updateData, {
      where: { id },
      returning: true, // To return the updated record
    });
    if (rowsUpdated === 0) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "No Users records found to update",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Users updated successfully",
      payload: updatedUsers.toJSON(),
    };
  } catch (err) {
    logger(err);
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error updating Users",
      payload: null,
    };
  }
};

// Delete a Users by ID
export const deleteUsersById = async (id: string) => {
  try {
    const deletedUsers = await UsersModel.destroy({ where: { id } });
    if (!deletedUsers) {
      return {
        status: false,
        statusCode: HttpStatusCode.NotFound,
        message: "Users not found",
        payload: null,
      };
    }
    return {
      status: true,
      statusCode: HttpStatusCode.OK,
      message: "Users deleted successfully",
      payload: null,
    };
  } catch (err) {
    return {
      status: false,
      statusCode: HttpStatusCode.InternalServerError,
      message: (err as Error).message || "Error deleting Users",
      payload: null,
    };
  }
};

export const getUserIdsByRole = async (role: string): Promise<string[]> => {
  try {
    const result = await UsersModel.findAll({
      where: { role, isActive: true, isDeleted: false },
      attributes: ["id"], // Only fetch IDs
      raw: true,
    });

    if (!result || result.length === 0) {
      logger(`No active users found with role: ${role}`);
      return [];
    }

    return result.map((user) => (user as any).id);
  } catch (error:any) {
    logger(`Error fetching user IDs by role ${role}:`, error);
    throw error;
  }
};


export const getSocketIdsByUserIds = async (userIds: string[]): Promise<string[]> => {
  try {
    if (!userIds || userIds.length === 0) {
      return [];
    }

    const result = await UsersModel.findAll({
      where: { 
        id: userIds,
        isActive: true,
        isDeleted: false 
      },
      attributes: ['activeSession'],
      raw: true
    });

    if (!result || result.length === 0) {
      logger('No active sessions found for provided user IDs');
      return [];
    }

  
    return result.map((user) => (user as unknown as { id: string }).id).filter((id): id is string => !!id);
  } catch (error) {
    logger('Error fetching socket IDs by user IDs:', (error as any));
    throw error;
  }
};

// /**
//  * Utility function to update user's active session
//  * @param userId - User ID
//  * @param socketId - Socket ID to store
//  */
// export const updateUserSocketSession = async (userId: string, socketId: string): Promise<boolean> => {
//   try {
//     const updateResult = await UsersModel.update(
//       { activeSession: { socketId, lastActive: new Date() } },
//       { where: { id: userId } }
//     );

//     return updateResult[0] > 0;
//   } catch (error) {
//     logger.error(`Error updating socket session for user ${userId}:`, error);
//     return false;
//   }
// };

// /**
//  * Utility function to clear user's active session
//  * @param socketId - Socket ID to clear
//  */
// export const clearSocketSession = async (socketId: string): Promise<boolean> => {
//   try {
//     const updateResult = await UsersModel.update(
//       { activeSession: null },
//       { where: { activeSession: { socketId } }
//     );

//     return updateResult[0] > 0;
//   } catch (error) {
//     logger.error(`Error clearing socket session ${socketId}:`, error);
//     return false;
//   }
// };